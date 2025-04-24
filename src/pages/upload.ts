// /src/pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFile } from '../../utils/storachaUploader'; // We'll create this helper

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const form = new formidable.IncomingForm({
    maxFileSize: 20 * 1024 * 1024, // 20 MB
    keepExtensions: true,
  });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File parsing error', details: err });
    }

    try {
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const fileName = uploadedFile.originalFilename || 'upload.txt';
    
    const cid = await uploadFile( fileBuffer, fileName);

      return res.status(200).json({
        cid,
        url: `https://ipfs.io/ipfs/${cid}`,
      });
    } catch (e) {
      return res.status(500).json({ error: 'Upload failed', details: e });
    }
  });
}
