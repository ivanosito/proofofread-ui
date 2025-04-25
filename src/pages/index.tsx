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

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType?.includes('application/json')) {
        throw new Error('Server error or invalid response format.');
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
    <div className="max-w-xl mx-auto p-6 text-center space-y-6">
      <h1 className="text-white text-2xl font-bold">📤 ProofOfRead — Upload a File to IPFS</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" method="POST" className="space-y-4">
        <input 
          type="file"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        <div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload to IPFS'}
          </button>
        </div>
      </form>

      {cid && (
        <div className="text-green-400 break-all">
          <p>✅ File uploaded successfully!</p>
          <p><strong>CID:</strong> {cid}</p>
          <p>
            🔗 <a className="underline" href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noreferrer">View on IPFS</a>
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-500">
          ❌ <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

// This is a Next.js page that allows users to upload files to IPFS using the Web3.Storage API.
// It includes a file input, a submit button, and displays the CID and IPFS link after a successful upload.
// The upload process is handled in the handleSubmit function, which sends the file to the server-side API endpoint.
// The server-side API endpoint processes the file and uploads it to IPFS, returning the CID.