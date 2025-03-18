declare module '@saasfly/ui/button' {
  import { ButtonHTMLAttributes } from 'react';

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }

  export const Button: React.FC<ButtonProps>;
}

declare module '@saasfly/ui/input' {
  import { InputHTMLAttributes } from 'react';

  export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    type?: string;
  }

  export const Input: React.ForwardRefExoticComponent<InputProps>;
}

declare module '@saasfly/ui/textarea' {
  import { TextareaHTMLAttributes, Ref, ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

  export const Textarea: ForwardRefExoticComponent<TextareaProps & RefAttributes<HTMLTextAreaElement>>;
}

declare module '@saasfly/ui/scroll-area' {
  import { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    viewportRef?: React.RefObject<HTMLDivElement>;
  }

  export const ScrollArea: ForwardRefExoticComponent<ScrollAreaProps & RefAttributes<HTMLDivElement>>;
  export const ScrollBar: React.FC<any>;
}

declare module '@saasfly/ui/card' {
  import { HTMLAttributes } from 'react';

  export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

  export const Card: React.FC<CardProps>;
  export const CardHeader: React.FC<CardProps>;
  export const CardTitle: React.FC<CardProps>;
  export const CardDescription: React.FC<CardProps>;
  export const CardContent: React.FC<CardProps>;
  export const CardFooter: React.FC<CardProps>;
}

declare module '@saasfly/ui/tabs' {
  import { HTMLAttributes } from 'react';

  export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }

  export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

  export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
    value: string;
  }

  export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
  }

  export const Tabs: React.FC<TabsProps>;
  export const TabsList: React.FC<TabsListProps>;
  export const TabsTrigger: React.FC<TabsTriggerProps>;
  export const TabsContent: React.FC<TabsContentProps>;
}

declare module '@saasfly/ui/skeleton' {
  import { HTMLAttributes } from 'react';

  export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

  export const Skeleton: React.FC<SkeletonProps>;
}

declare module '@saasfly/ai-assistant' {
  export interface ChatModel {
    id: string;
    name: string;
    description: string;
    maxTokens: number;
    tokenLimit: number;
  }

  export interface OpenAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  export interface ChatInputSchema {
    messages: OpenAIMessage[];
    model?: string;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    stream?: boolean;
    n?: number;
  }

  export const chatModels: ChatModel[];
  
  export function getChatMessages(chatId: string): Promise<any>;
}
