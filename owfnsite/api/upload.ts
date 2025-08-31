import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const filename = req.headers['x-vercel-filename'] || 'file.txt';
  
  if (!req.body) {
     return res.status(400).json({ message: 'No file body found.' });
  }

  try {
    const blob = await put(filename, req.body, {
      access: 'public',
    });
    
    return res.status(200).json(blob);

  } catch (error: any) {
    return res.status(500).json({ message: `Upload failed: ${error.message}` });
  }
}