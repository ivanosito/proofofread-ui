// src/pages/index.tsx
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cid, setCid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setCid(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    setCid(null);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${text}`);
      }

      const data = await res.json();
      setCid(data.cid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <h1>📤 ProofOfRead — Upload a File to IPFS</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" method="POST" style={{ marginTop: '2rem' }}>
        <input type="file" onChange={handleFileChange} />
        <br />
        <button
          type="submit"
          disabled={!file || uploading}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload to IPFS'}
        </button>
      </form>

      {cid && (
        <div style={{ marginTop: '2rem', wordBreak: 'break-all' }}>
          <p>✅ File uploaded successfully!</p>
          <p>
            <strong>CID:</strong> {cid}
          </p>
          <p>
            🔗{' '}
            <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noreferrer">
              View on IPFS
            </a>
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', color: 'red' }}>
          ❌ <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
