/**
 * Empty State Component
 * 
 * Displays a placeholder when no conversation is selected or
 * when there are no conversations available.
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = <MessageSquare className="h-12 w-12" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}
