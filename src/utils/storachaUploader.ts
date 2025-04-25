// src/utils/storachaUploader.ts

import { create } from '@web3-storage/w3up-client'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import type { Client } from '@web3-storage/w3up-client'
let client: Client | null = null

export async function uploadFile(buffer: Buffer, filename: string): Promise<string> {
  if (!client) {
    try {
      client = await create()

      // 👇 Replace with your real Storacha login email
      await client.login('adrianivanov@outlook.com')
      console.log('✅ First run identity setup complete for:', client.agent.did())

      const spaces = await client.spaces()
      const targetSpace = spaces.find(space => (space as any).name === 'ProofOfReadStorage')

      if (!targetSpace) {
        throw new Error('❌ Could not find space "ProofOfReadStorage". Check spelling or permissions.')
      }

      await client.setCurrentSpace(targetSpace.did())
      console.log('🗂️ Using space:', targetSpace.did())

    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  if (!client) {
    throw new Error('Client was not initialized')
  }

  const file = new File([buffer], filename || 'upload.pdf')
  const cid = await client.uploadFile(file)
  return cid.toString()
}

async function collectCar(out: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  for await (const chunk of out) {
    chunks.push(chunk)
  }
  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
