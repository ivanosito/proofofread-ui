import { create } from '@web3-storage/w3up-client';
import { CarReader } from '@ipld/car';
import * as fs from 'fs/promises';
import * as path from 'path';

const UCAN_PATH = path.join(process.cwd(), 'did-key-z6MkfsdVVS.ucan');

import type { Client } from '@web3-storage/w3up-client';
let client: Client | null = null;

export async function uploadFile(buffer: Buffer, filename: string): Promise<string> {
  if (!client) {
    console.log('🔐 Creating w3up client...');
    client = await create();

    const ucanBytes = await fs.readFile(UCAN_PATH);
    const carReader = await CarReader.fromBytes(ucanBytes);

    const blocks = [];
    for await (const block of carReader.blocks()) {
      blocks.push(block);
    }

    console.log(`🔑 Found ${blocks.length} UCAN blocks`);

    for (const block of blocks) {
      await client.addProof(block as any); // 👈 safely cast to `any`
    }

    const [rootCID] = await carReader.getRoots();
    await client.setCurrentSpace(`did:key:${rootCID.toString()}`);
    const space = client.currentSpace();

    if (!space) throw new Error('🚫 Could not set current space!');
    console.log(`🌌 Space activated: ${space.did()}`);
  }

  const file = new File([buffer], filename || 'upload.pdf');
  const cid = await client.uploadFile(file);
  console.log(`✅ Upload complete! CID: ${cid.toString()}`);
  return cid.toString();
}
