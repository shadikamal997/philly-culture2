import { storage } from "@/firebase/firebaseClient";
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";

/**
 * Upload an image to Firebase Storage
 * @param file - The image file to upload
 * @param folder - The folder path in Firebase Storage (e.g., 'programs', 'blog')
 * @param onProgress - Callback to track upload progress (0-100)
 * @returns Promise<string> - The download URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  folder: string = 'programs',
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB. Please upload a smaller image.');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;
      const path = `${folder}/${filename}`;

      // Create storage reference
      const storageRef = ref(storage, path);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error: any) {
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        }
      );
    } catch (error: any) {
      reject(error);
    }
  });
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds 5MB. Please upload a smaller image.'
    };
  }

  return { isValid: true };
}

/**
 * Create a preview URL for an image file
 * @param file - The image file
 * @returns Promise<string> - The preview URL (use URL.revokeObjectURL when done)
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}
