/**
 * Create Group Dialog
 * 
 * Dialog component for creating a new group chat conversation
 * with multiple participants.
 */

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '../dialog';
import { Button } from '../button';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { Label } from '../label';
import { ScrollArea } from '../scroll-area';
import { CheckCircle, Users, X, Image, Upload } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface CreateGroupDialogProps {
  users: User[];
  currentUserId: string;
  onCreateGroup: (data: {
    name: string;
    description?: string;
    members: string[];
    image?: File;
  }) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateGroupDialog({
  users,
  currentUserId,
  onCreateGroup,
  trigger,
  isOpen,
  onOpenChange
}: CreateGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Exclude current user from the list
  const filteredUsers = users.filter(user => user.id !== currentUserId);
  
  // Filter users based on search query
  const searchResults = searchQuery 
    ? filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredUsers;

  // Toggle user selection
  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!name || selectedUsers.length === 0) return;
    
    setSubmitting(true);
    
    try {
      await onCreateGroup({
        name,
        description,
        members: [...selectedUsers, currentUserId], // Include current user
        image: image || undefined
      });
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedUsers([]);
      setImage(null);
      setPreviewUrl(null);
      
      // Close dialog
      onOpenChange?.(false);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if form is valid
  const isValid = name.trim() !== '' && selectedUsers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-image" className="text-right">
              Group Image
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              <div 
                className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden"
                onClick={() => document.getElementById('group-image')?.click()}
                style={{cursor: 'pointer'}}
              >
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Group preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <Input
                  id="group-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('group-image')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                {previewUrl && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-name" className="text-right">
              Group Name
            </Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional group description"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Members
            </Label>
            <div className="col-span-3 space-y-3">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <div 
                        key={user.id}
                        className="flex items-center bg-primary/10 py-1 px-2 rounded-full"
                      >
                        <span className="text-sm font-medium mr-1">{user.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleUser(user.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              
              <ScrollArea className="h-[200px] border rounded-md">
                {searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className={`p-2 flex items-center justify-between hover:bg-muted/50 cursor-pointer ${
                          selectedUsers.includes(user.id) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchQuery ? 'No users match your search' : 'No users available'}
                  </div>
                )}
              </ScrollArea>
              
              <div className="text-xs text-muted-foreground">
                Selected: {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || submitting}
          >
            {submitting ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
