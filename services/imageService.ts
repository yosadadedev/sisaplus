import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export const imageService = {
  /**
   * Upload image to Firebase Storage
   * @param uri - Local image URI
   * @param folder - Storage folder (e.g., 'foods', 'profiles')
   * @param fileName - Optional custom filename
   * @returns Promise with download URL and storage path
   */
  async uploadImage(
    uri: string,
    folder: string,
    fileName?: string
  ): Promise<ImageUploadResult> {
    try {
      // Generate unique filename if not provided
      const timestamp = Date.now();
      const finalFileName = fileName || `image_${timestamp}.jpg`;
      const storagePath = `${folder}/${finalFileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Fetch the image as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the blob
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        url: downloadURL,
        path: storagePath,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  /**
   * Upload multiple images to Firebase Storage
   * @param uris - Array of local image URIs
   * @param folder - Storage folder
   * @returns Promise with array of upload results
   */
  async uploadMultipleImages(
    uris: string[],
    folder: string
  ): Promise<ImageUploadResult[]> {
    try {
      const uploadPromises = uris.map((uri, index) => {
        const fileName = `image_${Date.now()}_${index}.jpg`;
        return this.uploadImage(uri, folder, fileName);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  },

  /**
   * Delete image from Firebase Storage
   * @param path - Storage path of the image
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  },

  /**
   * Delete multiple images from Firebase Storage
   * @param paths - Array of storage paths
   */
  async deleteMultipleImages(paths: string[]): Promise<void> {
    try {
      const deletePromises = paths.map((path) => this.deleteImage(path));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      throw new Error('Failed to delete images');
    }
  },
};