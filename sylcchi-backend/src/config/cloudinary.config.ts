import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { envVars } from "./env";

const cloudName = envVars.CLOUDINARY_CLOUD_NAME;
const apiKey = envVars.CLOUDINARY_API_KEY;
const apiSecret = envVars.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

type UploadBufferOptions = {
  folder?: string;
  filename?: string;
  resourceType?: "image" | "raw" | "auto";
  optimizeImage?: boolean;
};

type UploadedCloudinaryFile = {
  secureUrl: string;
  publicId: string;
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options: UploadBufferOptions = {},
): Promise<UploadedCloudinaryFile> => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resourceType ?? "image",
        folder: options.folder,
        use_filename: Boolean(options.filename),
        unique_filename: true,
        filename_override: options.filename,
        transformation: options.optimizeImage
          ? [
              {
                fetch_format: "auto",
                quality: "auto:eco",
              },
            ]
          : undefined,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

type ProfileImageUploadOptions = {
  userId: string;
  filename?: string;
};

export const uploadProfileImage = async (
  buffer: Buffer,
  options: ProfileImageUploadOptions,
): Promise<UploadedCloudinaryFile> => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: `users/profile/${options.userId}`,
        use_filename: Boolean(options.filename),
        unique_filename: true,
        ...(options.filename ? { filename_override: options.filename } : {}),
        transformation: [
          {
            width: 300,
            height: 300,
            crop: "fill",
            gravity: "face",
          },
          {
            fetch_format: "auto",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Profile image upload failed"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

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
