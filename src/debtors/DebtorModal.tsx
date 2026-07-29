import { useState, useEffect } from "react";
import {
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
  usePresignUploadsMutation,
} from "@/debtors/debtorApi";
import { Loader2, ImagePlus, X, Camera } from "lucide-react";
import type { Debtor, UploadedImage } from "@/shared/types/debtor";
import { showSuccessToast } from "@/shared/utils/toastConfig";
import {
  uploadImagesToR2,
  validateImageFile,
  MAX_IMAGES,
} from "@/shared/utils/uploadToR2";
import CameraCapture from "@/shared/components/CameraCapture";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface DebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor?: Debtor | null; // If provided, we're editing; if null, we're creating
}

export default function DebtorModal({
  isOpen,
  onClose,
  debtor,
}: DebtorModalProps) {
  const [createDebtor] = useCreateDebtorMutation();
  const [updateDebtor] = useUpdateDebtorMutation();
  const [presignUploads] = usePresignUploadsMutation();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    amountOwed: "",
    description: "",
  });

  const [existingImages, setExistingImages] = useState<UploadedImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(debtor);
  const modalTitle = isEditing ? "Edit Debtor" : "Add New Debtor";
  const submitButtonText = isEditing ? "Update Debtor" : "Add Debtor";
  const loadingText = isEditing ? "Updating..." : "Adding...";

  useEffect(() => {
    if (isOpen) {
      if (debtor) {
        setFormData({
          name: debtor.name,
          phoneNumber: debtor.phoneNumber || "",
          amountOwed: debtor.amountOwed.toString(),
          description: debtor.description || "",
        });
        setExistingImages(debtor.images ?? []);
      } else {
        setFormData({
          name: "",
          phoneNumber: "",
          amountOwed: "",
          description: "",
        });
        setExistingImages([]);
      }
      setRemovedImageIds([]);
      setNewFiles([]);
      setNewPreviews([]);
      setError(null);
    }
  }, [isOpen, debtor]);

  const visibleExisting = existingImages.filter(
    (img) => !removedImageIds.includes(img.id)
  );
  const totalImages = visibleExisting.length + newFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    const room = MAX_IMAGES - totalImages;
    if (room <= 0) {
      setError(`You can attach at most ${MAX_IMAGES} photos`);
      return;
    }
    const accepted: File[] = [];
    for (const file of files.slice(0, room)) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      accepted.push(file);
    }
    setError(null);
    const next = [...newFiles, ...accepted];
    setNewFiles(next);
    setNewPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    const next = newFiles.filter((_, i) => i !== index);
    setNewFiles(next);
    setNewPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (id: number) => {
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const newKeys = newFiles.length
        ? await uploadImagesToR2(newFiles, presignUploads)
        : [];

      if (isEditing && debtor) {
        await updateDebtor({
          id: debtor.id,
          data: {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            amountOwed: parseFloat(formData.amountOwed) || 0,
            description: formData.description,
            ...(newKeys.length ? { addImageKeys: newKeys } : {}),
            ...(removedImageIds.length ? { removeImageIds: removedImageIds } : {}),
          },
        }).unwrap();
        showSuccessToast("Debtor updated successfully");
      } else {
        await createDebtor({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          amountOwed: parseFloat(formData.amountOwed) || 0,
          description: formData.description,
          ...(newKeys.length ? { imageKeys: newKeys } : {}),
        }).unwrap();
        showSuccessToast("Debtor added successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Debtor operation error:", error);
      setError(
        error?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} debtor`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (isCameraOpen) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isCameraOpen) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              required
              placeholder="Enter debtor's full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="tel"
              placeholder="e.g 0241234567"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountOwed">Amount Owed (GH₵) *</Label>
            <Input
              id="amountOwed"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              required
              placeholder="0.00"
              value={formData.amountOwed}
              onChange={(e) =>
                setFormData({ ...formData, amountOwed: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              className="resize-none"
              placeholder="Add any notes about this debtor..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="debtor-image">Photos (optional)</Label>
              <span className="text-xs text-muted-foreground">
                {totalImages}/{MAX_IMAGES}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {visibleExisting.map((img) => (
                <div key={img.id} className="relative h-20 w-20">
                  <img
                    src={img.url}
                    alt="Debtor"
                    className="h-20 w-20 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {newPreviews.map((preview, index) => (
                <div key={preview} className="relative h-20 w-20">
                  <img
                    src={preview}
                    alt="New"
                    className="h-20 w-20 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {canAddMore && (
                <>
                  <label
                    htmlFor="debtor-image"
                    className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs">Upload</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-xs">Take photo</span>
                  </button>
                </>
              )}
            </div>
            <input
              id="debtor-image"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingText}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => addFiles([file])}
      />
    </Dialog>
  );
}
