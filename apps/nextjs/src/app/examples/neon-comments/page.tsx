'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@saasfly/ui/button';
import { Input } from '@saasfly/ui/input';

interface Comment {
  id: number;
  comment: string;
  created_at: string;
}

export default function NeonCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch comments on initial load
  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/examples/neon-comments');
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      } else {
        setError(data.error || 'Failed to load comments');
      }
    } catch (err) {
      setError('Error fetching comments: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/examples/neon-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        setSuccess('Comment added successfully!');
        // Refresh the comments list
        fetchComments();
      } else {
        setError(data.error || 'Failed to add comment');
      }
    } catch (err) {
      setError('Error adding comment: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Neon Database Comments Example</h1>
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full"
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Comment'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-100 text-green-800 rounded-md">
              {success}
            </div>
          )}
        </form>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        
        {loading && <p>Loading comments...</p>}
        
        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li 
                key={comment.id} 
                className="p-4 bg-white border border-gray-200 rounded-md shadow-sm"
              >
                <p className="mb-2">{comment.comment}</p>
                <p className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to add one!</p>
        )}
      </div>
    </div>
  );
}
