import type { PresignRequest, PresignResponse } from "@/shared/types/debtor";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES = 5;

export const validateImageFile = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: unsupported type (use JPEG, PNG or WEBP)`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: too large (max 5MB)`;
  }
  return null;
};

type PresignTrigger = (arg: PresignRequest) => {
  unwrap: () => Promise<PresignResponse>;
};

export const uploadImagesToR2 = async (
  files: File[],
  presign: PresignTrigger
): Promise<string[]> => {
  if (!files.length) return [];

  const { data } = await presign({
    files: files.map((f) => ({ filename: f.name, contentType: f.type })),
  }).unwrap();

  await Promise.all(
    data.map((target, i) =>
      fetch(target.uploadUrl, {
        method: "PUT",
        body: files[i],
        headers: { "Content-Type": files[i].type },
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to upload ${files[i].name}`);
      })
    )
  );

  return data.map((target) => target.key);
};
