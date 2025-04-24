// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs/promises'
import { uploadFile } from '@/utils/storachaUploader'

export const config = { api: { bodyParser: false } }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024, keepExtensions: true })

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File parse error', details: err.message })
    }

    try {
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
      if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const buffer = await fs.readFile(uploadedFile.filepath)
      const cid = await uploadFile(buffer, uploadedFile.originalFilename || 'upload.bin')

      return res.status(200).json({ cid, url: `https://ipfs.io/ipfs/${cid}` })
    } catch (e: any) {
      console.error('🔥 Upload failed:', e)
      return res.status(500).json({ error: 'Upload failed', details: e.message })
    }
  })
}
