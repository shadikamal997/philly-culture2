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
      console.log('[Upload] Starting upload for:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
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

      console.log('[Upload] Creating storage reference:', path);

      // Create storage reference
      const storageRef = ref(storage, path);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('[Upload] Progress:', progress.toFixed(1), '%');
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('[Upload] Error:', error);
          console.error('[Upload] Error code:', error.code);
          console.error('[Upload] Error message:', error.message);
          
          // Provide more specific error messages
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Firebase Storage not configured or permissions denied. Please set up Firebase Storage first.'));
          } else if (error.code === 'storage/canceled') {
            reject(new Error('Upload was canceled'));
          } else if (error.code === 'storage/unknown') {
            reject(new Error('Firebase Storage is not initialized. Please enable Firebase Storage in your project.'));
          } else {
            reject(new Error(`Upload failed: ${error.message}`));
          }
        },
        async () => {
          // Upload completed successfully
          try {
            console.log('[Upload] Upload complete, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[Upload] Success! URL:', downloadURL);
            resolve(downloadURL);
          } catch (error: any) {
            console.error('[Upload] Failed to get download URL:', error);
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        }
      );
    } catch (error: any) {
      console.error('[Upload] Initialization error:', error);
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
