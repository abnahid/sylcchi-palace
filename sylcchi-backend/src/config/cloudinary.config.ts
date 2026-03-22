import { v2 as cloudinary } from "cloudinary";
import { envVars } from "../app/config/env";

function extractPublicId(filePath: string): string | null {
  if (!filePath) {
    return null;
  }

  const withoutQuery = filePath.split("?")[0];
  const uploadMarker = "/upload/";
  const markerIndex = withoutQuery.indexOf(uploadMarker);

  if (markerIndex < 0) {
    return null;
  }

  const afterUpload = withoutQuery.slice(markerIndex + uploadMarker.length);
  const segments = afterUpload.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const versionPattern = /^v\d+$/;
  if (versionPattern.test(segments[0])) {
    segments.shift();
  }

  if (segments.length === 0) {
    return null;
  }

  const joined = segments.join("/");
  return joined.replace(/\.[^/.]+$/, "");
}

export const deleteFileFromCloudinary = async (
  filePath: string,
): Promise<void> => {
  const publicId = extractPublicId(filePath);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    if (envVars.NODE_ENV === "development") {
      console.warn("Cloudinary cleanup failed", error);
    }
  }
};
