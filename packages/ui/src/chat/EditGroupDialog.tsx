"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";
import { useToast } from "../use-toast";
import { Upload, X, Camera } from "lucide-react";
import { cn } from "../utils/cn";

interface EditGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  initialName: string;
  initialAvatar?: string;
  onGroupUpdated: () => void;
}

export function EditGroupDialog({
  isOpen,
  onClose,
  groupId,
  initialName,
  initialAvatar,
  onGroupUpdated
}: EditGroupDialogProps) {
  const [name, setName] = useState(initialName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatar || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatar || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type and size (2MB limit)
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for the group",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('groupId', groupId);
      formData.append('name', name);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatarPreview === null && initialAvatar) {
        // If avatar was cleared
        formData.append('removeAvatar', 'true');
      }
      
      const response = await fetch('/api/chat/groups/update', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        toast({
          title: "Group updated",
          description: "Group details have been successfully updated",
        });
        onGroupUpdated();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Update failed",
          description: error.error || "Failed to update group details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Update your group chat details and image.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} alt={name} />
                <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              {avatarPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                  onClick={clearAvatar}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Label
                htmlFor="avatar-upload"
                className={cn(
                  "cursor-pointer inline-flex items-center justify-center gap-2",
                  "rounded-md text-sm font-medium ring-offset-background",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                )}
              >
                <Upload className="h-4 w-4" />
                <span>{avatarPreview ? "Change avatar" : "Upload avatar"}</span>
              </Label>
              
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
