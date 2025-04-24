// src/utils/storachaUploader.ts

import { create } from '@web3-storage/w3up-client'
import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'
import * as fs from 'fs/promises'
import * as path from 'path'
import type { Block } from '@ucanto/interface'

const UCAN_PATH = path.join(process.cwd(), 'did-key-z6MkfsdVVS.ucan')

import type { Client } from '@web3-storage/w3up-client'
let client: Client | null = null

export async function uploadFile(buffer: Buffer, filename: string): Promise<string> {
  if (!client) {
    try {
      client = await create()

      const spaces = await client.spaces()
      if (spaces.length === 0) {
        const newSpace = await client.createSpace('proof-of-read-space')
        await client.setCurrentSpace(newSpace.did())
      } else {
        await client.setCurrentSpace(spaces[0].did())
      }

      const ucanBytes = await fs.readFile(UCAN_PATH)
      const carReader = await CarReader.fromBytes(ucanBytes)

      const blocks: Block[] = []
      for await (const block of carReader.blocks()) {
        if (block.cid.version !== 1) {
          throw new Error(`Unsupported CID version: ${block.cid.version}`)
        }
        blocks.push({
          cid: block.cid as any,
          bytes: block.bytes
        } as Block)
      }

      const delegation = await importDAG(blocks)
      console.log('🧾 Delegation:', JSON.stringify(delegation, null, 2))

      try {
        await client.addProof(delegation)
      } catch (err: any) {
        console.error('❌ Invalid UCAN delegation:', err)
        throw new Error('Invalid UCAN format. Ensure it is Base64URL-safe.')
      }

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
