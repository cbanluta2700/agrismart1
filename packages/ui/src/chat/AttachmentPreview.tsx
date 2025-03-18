import React from 'react';
import { File, X, Download, FileText, Image as ImageIcon, Film, Music, Archive } from 'lucide-react';
import { Button } from '../button';
import { cn } from '../utils/cn';

export interface AttachmentType {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface AttachmentPreviewProps {
  attachment: AttachmentType;
  onRemove?: () => void;
  showRemove?: boolean;
  className?: string;
  compact?: boolean;
}

export function AttachmentPreview({
  attachment,
  onRemove,
  showRemove = false,
  className = '',
  compact = false,
}: AttachmentPreviewProps) {
  const isImage = attachment.type.startsWith('image/');
  const isVideo = attachment.type.startsWith('video/');
  const isAudio = attachment.type.startsWith('audio/');
  const isPdf = attachment.type === 'application/pdf';
  const isArchive = ['application/zip', 'application/x-rar-compressed', 'application/x-tar'].includes(attachment.type);
  
  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // Get icon based on file type
  const getIcon = () => {
    if (isImage) return <ImageIcon className="w-6 h-6" />;
    if (isVideo) return <Film className="w-6 h-6" />;
    if (isAudio) return <Music className="w-6 h-6" />;
    if (isPdf) return <FileText className="w-6 h-6" />;
    if (isArchive) return <Archive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  // For compact preview (used in message bubbles)
  if (compact) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center p-2 gap-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors max-w-xs",
          className
        )}
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-gray-500">{formatSize(attachment.size)}</p>
        </div>
        <Download className="w-4 h-4 flex-shrink-0" />
      </a>
    );
  }

  // For image preview
  if (isImage) {
    return (
      <div className={cn("relative group", className)}>
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-80 max-w-full rounded-md object-contain"
        />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={attachment.url}
            download={attachment.name}
            className="p-1 rounded-full bg-gray-800/70 text-white hover:bg-gray-700/70"
          >
            <Download className="w-4 h-4" />
          </a>
          {showRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 p-1 rounded-full"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="absolute bottom-2 left-2 text-xs bg-gray-800/70 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {attachment.name} ({formatSize(attachment.size)})
        </div>
      </div>
    );
  }

  // For video preview
  if (isVideo) {
    return (
      <div className={cn("relative group", className)}>
        <video
          src={attachment.url}
          controls
          className="max-h-80 max-w-full rounded-md"
        />
        {showRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 p-1 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // For audio preview
  if (isAudio) {
    return (
      <div className={cn("relative group p-3 border rounded-md", className)}>
        <audio
          src={attachment.url}
          controls
          className="max-w-full"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm truncate">{attachment.name}</span>
          <span className="text-xs text-gray-500">{formatSize(attachment.size)}</span>
        </div>
        {showRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 p-1 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Default file preview
  return (
    <div className={cn(
      "flex items-center p-3 gap-3 rounded-md border border-gray-200 bg-gray-50 group relative",
      className
    )}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{attachment.name}</p>
        <p className="text-sm text-gray-500">{formatSize(attachment.size)}</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={attachment.url}
          download={attachment.name}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Download className="w-5 h-5" />
        </a>
        {showRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 p-1"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
