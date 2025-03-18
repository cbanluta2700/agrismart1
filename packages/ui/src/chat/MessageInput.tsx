"use client";

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Button } from "../button";
import { Textarea } from "../textarea";
import { Paperclip, Smile, Send, Mic, Image, File, X, Loader2 } from "lucide-react";
import { cn } from "../utils/cn";
import { AttachmentPreview, AttachmentType } from './AttachmentPreview';
import { formatFileSize, extensionToMimeType } from './utils/attachment-utils';
import { Progress } from '../progress';

export interface UploadingFile extends File {
  id: string;
  progress: number;
  error?: string;
  status: 'uploading' | 'complete' | 'error' | 'cancelled';
}

export interface MessageInputProps {
  onSendMessage?: (content: string, attachments?: File[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showAttachmentOptions?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  attachments?: File[];
  onAttachmentsChange?: (attachments: File[]) => void;
  showSendButton?: boolean;
  onSend?: () => void;
  conversationId?: string;
  onFileUpload?: (file: File, conversationId: string, onProgress: (progress: number) => void) => Promise<AttachmentType | null>;
  uploadingFiles?: Record<string, UploadingFile>;
  onCancelUpload?: (fileId: string) => void;
}

export const MessageInput = forwardRef<HTMLDivElement, MessageInputProps>(({ 
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000,
  showAttachmentOptions = true,
  value,
  onChange,
  attachments: externalAttachments,
  onAttachmentsChange,
  showSendButton = false,
  onSend,
  conversationId,
  onFileUpload,
  uploadingFiles = {},
  onCancelUpload
}: MessageInputProps, ref) => {
  const [message, setMessage] = useState(value || '');
  const [attachments, setAttachments] = useState<File[]>(externalAttachments || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTime = useRef<number>(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setMessage(value);
    }
  }, [value]);

  // Update internal state when external attachments change
  useEffect(() => {
    if (externalAttachments !== undefined) {
      setAttachments(externalAttachments);
    }
  }, [externalAttachments]);

  // Handle typing indicator logic
  useEffect(() => {
    if (onTyping) {
      lastTypingTime.current = Date.now();
      onTyping();

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = setTimeout(() => {
        const now = Date.now();
        if (now - lastTypingTime.current >= 2000) {
          onTyping();
        }
      }, 3000);
    }
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [message, onTyping]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFileChange = async (files: File[]) => {
    // If we have a direct file upload handler and a conversation ID, use it
    if (onFileUpload && conversationId) {
      for (const file of files) {
        // Create a unique ID for the file
        const fileId = crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`;
        const fileWithId = Object.assign(file, { 
          id: fileId,
          progress: 0,
          status: 'uploading' as const
        });
        
        // Add to local attachments first for UI feedback
        if (onAttachmentsChange) {
          onAttachmentsChange([...attachments, fileWithId]);
        } else {
          setAttachments(prev => [...prev, fileWithId]);
        }
        
        // Start the upload process
        await onFileUpload(file, conversationId, (progress) => {
          // Update progress in the file object
          const updatedFile = Object.assign({}, fileWithId, { progress });
          
          if (onAttachmentsChange) {
            const index = attachments.findIndex(f => (f as any).id === fileId);
            if (index !== -1) {
              const newAttachments = [...attachments];
              newAttachments[index] = updatedFile;
              onAttachmentsChange(newAttachments);
            }
          } else {
            setAttachments(prev => {
              const index = prev.findIndex(f => (f as any).id === fileId);
              if (index !== -1) {
                const newAttachments = [...prev];
                newAttachments[index] = updatedFile;
                return newAttachments;
              }
              return prev;
            });
          }
        });
      }
    } else {
      // Just add to local attachments if no upload handler
      if (onAttachmentsChange) {
        onAttachmentsChange([...attachments, ...files]);
      } else {
        setAttachments(prev => [...prev, ...files]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = attachments[index];
    
    // If it's an uploading file and we have a cancel handler, use it
    if (fileToRemove && (fileToRemove as any).id && onCancelUpload && uploadingFiles[(fileToRemove as any).id]) {
      onCancelUpload((fileToRemove as any).id);
    }
    
    // Remove from UI either way
    if (onAttachmentsChange) {
      const newAttachments = [...attachments];
      newAttachments.splice(index, 1);
      onAttachmentsChange(newAttachments);
    } else {
      setAttachments(prev => {
        const newAttachments = [...prev];
        newAttachments.splice(index, 1);
        return newAttachments;
      });
    }
  };

  const handleSendMessage = () => {
    if (disabled || (!message.trim() && attachments.length === 0)) return;
    
    if (onSend) {
      onSend();
    } else if (onSendMessage) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Convert File objects to AttachmentType for preview
  const fileToAttachment = (file: File, index: number): AttachmentType => {
    const uploadingFile = file as unknown as UploadingFile;
    const isUploading = 'status' in uploadingFile && uploadingFile.status === 'uploading';
    const hasError = 'error' in uploadingFile && uploadingFile.error;
    
    return {
      id: 'id' in uploadingFile ? uploadingFile.id : `temp-${index}`,
      name: file.name,
      size: file.size,
      type: file.type || extensionToMimeType(file.name.split('.').pop() || ''),
      url: URL.createObjectURL(file),
    };
  };

  return (
    <div ref={ref} className="border-t border-border px-4 py-2">
      {attachments.length > 0 && (
        <div className="flex flex-col gap-2 mb-3 overflow-hidden">
          {attachments.map((file, index) => {
            const uploadingFile = file as unknown as UploadingFile;
            const isUploading = 'status' in uploadingFile && uploadingFile.status === 'uploading';
            const hasError = 'error' in uploadingFile && uploadingFile.error;
            
            return (
              <div key={index} className="relative">
                <AttachmentPreview
                  attachment={fileToAttachment(file, index)}
                  showRemove={true}
                  onRemove={() => handleRemoveFile(index)}
                />
                
                {isUploading && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Uploading... {uploadingFile.progress}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 py-0 px-2 text-xs"
                        onClick={() => onCancelUpload?.(uploadingFile.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <Progress value={uploadingFile.progress} className="h-1" />
                  </div>
                )}
                
                {hasError && (
                  <div className="mt-1 text-xs text-destructive">
                    Error: {uploadingFile.error}. <button className="underline" onClick={() => handleFileChange([file])}>Try again</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {showAttachmentOptions && (
          <div className="flex-shrink-0">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            {showAttachments && (
              <div className="absolute bottom-16 left-4 bg-popover border border-border rounded-lg p-2 shadow-md flex gap-2 z-10">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={triggerFileInput}
                  title="Image"
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={triggerFileInput}
                  title="Document"
                >
                  <File className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    handleFileChange(Array.from(e.target.files || []));
                    e.target.value = ''; // Reset so the same file can be selected again
                  }}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp3,.mp4"
                />
              </div>
            )}
          </div>
        )}
        
        <div className="relative flex-grow">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              "resize-none py-2.5 min-h-[44px] max-h-[150px] pr-12",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          <div className="absolute right-3 bottom-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-full h-9 w-9 p-0"
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            onClick={handleSendMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 bg-popover border border-border rounded-lg p-2 shadow-md z-10">
          {/* Emoji picker would go here - using a placeholder for now */}
          <div className="grid grid-cols-8 gap-1 w-[320px] h-[200px] overflow-y-auto">
            {["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥"].map((emoji, i) => (
              <button
                key={i}
                type="button"
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded-md"
                onClick={() => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {maxLength && (
        <div className={cn(
          "text-xs text-right mt-1 text-muted-foreground",
          message.length > maxLength * 0.9 && "text-amber-500",
          message.length >= maxLength && "text-destructive"
        )}>
          {message.length}/{maxLength}
        </div>
      )}
    </div>
  );
});
