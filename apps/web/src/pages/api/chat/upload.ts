import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@saasfly/auth';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import prisma from '@saasfly/db';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File upload request handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Parse multipart form data
    const { fields, files } = await parseForm(req);
    
    // Validate conversation ID
    const conversationId = fields.conversationId;
    if (!conversationId || typeof conversationId !== 'string') {
      return res.status(400).json({ error: 'Missing required field: conversationId' });
    }

    // Process uploaded files
    const uploadedFiles = await processFiles(files.files || []);
    
    // Check if user is a member of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if the user is a participant in this conversation
    const isParticipant = conversation.participants.some(
      (p: { userId: string }) => p.userId === session.user?.id
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to upload to this conversation' });
    }

    // If messageId is provided, attach file to existing message
    // Otherwise, create a new message with the attachment
    let messageAttachment;
    
    if (fields.messageId) {
      // Check if the message exists and belongs to the user
      const message = await prisma.message.findUnique({
        where: { id: fields.messageId },
      });
      
      if (!message || message.senderId !== session.user.id) {
        return res.status(403).json({ error: 'Not authorized to attach files to this message' });
      }
      
      // Create attachment for existing message
      messageAttachment = await prisma.messageAttachment.create({
        data: {
          id: uuidv4(),
          messageId: fields.messageId,
          name: uploadedFiles[0]?.name || 'File',
          size: uploadedFiles[0]?.size || 0,
          type: uploadedFiles[0]?.type || 'application/octet-stream',
          url: uploadedFiles[0]?.url || '',
        },
      });
    } else {
      // Create a new message with the attachment
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: session.user?.id || '',
          content: 'Shared a file', // Default message content for file sharing
          attachments: {
            create: {
              id: uuidv4(),
              name: uploadedFiles[0]?.name || 'File',
              size: uploadedFiles[0]?.size || 0,
              type: uploadedFiles[0]?.type || 'application/octet-stream',
              url: uploadedFiles[0]?.url || '',
            },
          },
        },
        include: {
          attachments: true,
        },
      });
      
      messageAttachment = message.attachments[0] || null;
    }

    // Return the file information
    return res.status(200).json({
      id: messageAttachment.id,
      name: messageAttachment.name,
      size: messageAttachment.size,
      type: messageAttachment.type,
      url: messageAttachment.url,
      messageId: messageAttachment.messageId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to process upload' });
  }
}

// Parse form data from request
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// Process uploaded files and move them to the upload directory
async function processFiles(fileField: formidable.File | formidable.File[]): Promise<Array<{ name: string; url: string; size: number; type: string }>> {
  if (!fileField) return [];
  
  const files = Array.isArray(fileField) ? fileField : [fileField];
  const result = [];

  for (const file of files) {
    const fileName = `${uuidv4()}${path.extname(file.originalFilename || '')}`;
    const newPath = path.join(uploadDir, fileName);
    
    // Move file to final destination
    if (file.filepath !== newPath) {
      await fs.promises.copyFile(file.filepath, newPath);
      await fs.promises.unlink(file.filepath);
    }
    
    // Create public URL for the file
    const fileUrl = `/uploads/${fileName}`;
    
    result.push({
      name: file.originalFilename || fileName,
      url: fileUrl,
      size: file.size,
      type: file.mimetype || 'application/octet-stream',
    });
  }

  return result;
}
