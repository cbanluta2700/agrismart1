/**
 * Utility functions for handling file attachments in chat
 */

import { AttachmentType } from '../AttachmentPreview';

// Maps mime types to file categories
export const getFileCategory = (mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
       'text/plain', 'application/rtf', 'text/csv'].includes(mimeType)) return 'document';
  if (['application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/x-7z-compressed', 
       'application/gzip'].includes(mimeType)) return 'archive';
  return 'other';
};

// Convert file size to human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
};

// Check if the file is suitable for direct preview
export const canPreviewFile = (attachment: AttachmentType): boolean => {
  return attachment.type.startsWith('image/') || 
         attachment.type.startsWith('video/') || 
         attachment.type.startsWith('audio/') || 
         attachment.type === 'application/pdf';
};

// Get a preview URL for an attachment
export const getPreviewUrl = (attachment: AttachmentType): string => {
  // For files that can be displayed directly in the browser, use the file URL
  if (canPreviewFile(attachment)) {
    return attachment.url;
  }
  // For other file types, you could return a placeholder based on file type
  const category = getFileCategory(attachment.type);
  return `/images/file-icons/${category}-placeholder.svg`;
};

// Convert a file extension to a likely mime type (for uploads where mime type might not be detected)
export const extensionToMimeType = (extension: string): string => {
  const map: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'csv': 'text/csv',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'tar': 'application/x-tar',
    '7z': 'application/x-7z-compressed',
    'gz': 'application/gzip',
  };
  
  const normalizedExt = extension.toLowerCase().replace('.', '');
  return map[normalizedExt] || 'application/octet-stream';
};
