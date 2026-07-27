import { useEffect, useRef, useState, useCallback } from "react";
import { X, RefreshCcw, Camera } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCapture({
  isOpen,
  onClose,
  onCapture,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [isReady, setIsReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      const name = (err as DOMException)?.name;
      if (name === "NotAllowedError") {
        setError(
          "Camera permission was denied. Allow camera access and try again."
        );
      } else if (name === "NotFoundError") {
        setError("No camera was found on this device.");
      } else {
        setError("Could not access the camera.");
      }
    }
  }, [facingMode]);

  useEffect(() => {
    if (!isOpen) return;
    startStream();
    return () => stopStream();
  }, [isOpen, startStream, stopStream]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.9
    );
  };

  if (!isOpen) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex flex-col bg-black/90">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-white">Take a photo</span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-4">
        {error ? (
          <p className="max-w-xs text-center text-sm text-white">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setIsReady(true)}
            className="max-h-full max-w-full rounded-lg"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-6 p-6">
        {error ? (
          <Button type="button" variant="secondary" onClick={startStream}>
            Retry
          </Button>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                setFacingMode((mode) =>
                  mode === "environment" ? "user" : "environment"
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Switch camera"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isReady}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white transition-colors hover:bg-white/40 disabled:opacity-50"
              aria-label="Capture photo"
            >
              <Camera className="h-6 w-6" />
            </button>
            <span className="h-11 w-11" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
}
