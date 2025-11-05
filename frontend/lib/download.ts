/**
 * Utility functions for handling authenticated file downloads
 */

import { getAuthToken } from "./auth-client";
import { API_BASE_URL } from "./api/config";

/**
 * Download a file from an authenticated endpoint
 * This function fetches the file with proper authentication headers,
 * then triggers a browser download using the Blob API
 */
export async function downloadAuthenticatedFile(
  path: string,
  filename?: string
): Promise<void> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download failed: ${response.statusText}. ${errorText}`);
  }

  // Get the blob from the response
  const blob = await response.blob();
  
  // Extract filename from Content-Disposition header if not provided
  let downloadFilename = filename;
  if (!downloadFilename) {
    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      // Try to match filename with quotes first (most common format)
      let filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
      if (!filenameMatch) {
        // Try without quotes
        filenameMatch = contentDisposition.match(/filename=([^;,\s]+)/i);
      }
      if (filenameMatch && filenameMatch[1]) {
        downloadFilename = filenameMatch[1].trim();
      }
    }
  }
  
  // Fallback filename
  if (!downloadFilename) {
    downloadFilename = "download";
  }

  // Create a blob URL and trigger download
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = downloadFilename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
