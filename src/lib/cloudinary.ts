const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
  | string
  | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
  | string
  | undefined;

export const isCloudinaryConfigured = (): boolean =>
  Boolean(CLOUD_NAME && UPLOAD_PRESET);

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

/**
 * Unsigned image upload straight from the browser. Returns the secure URL to
 * store on the record. Requires VITE_CLOUDINARY_CLOUD_NAME and
 * VITE_CLOUDINARY_UPLOAD_PRESET (an unsigned preset).
 */
export const uploadImageToCloudinary = async (
  file: File
): Promise<string> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error(`Image upload failed (${res.status}).`);
  }

  const data = (await res.json()) as CloudinaryUploadResponse;
  if (!data.secure_url) {
    throw new Error(data.error?.message || "Image upload returned no URL.");
  }

  return data.secure_url;
};
