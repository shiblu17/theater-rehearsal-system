import webPush from 'web-push';
import fs from 'fs';
import path from 'path';

const KEYS_FILE = path.join(process.cwd(), 'vapid-keys.json');

export interface VAPIDKeys {
  publicKey: string;
  privateKey: string;
}

export function getVAPIDKeys(): VAPIDKeys {
  // 1. Try env variables
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    };
  }

  // 2. Try file storage
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const content = fs.readFileSync(KEYS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading VAPID keys file:', error);
  }

  // 3. Generate new VAPID keys
  const keys = webPush.generateVAPIDKeys();
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving generated VAPID keys:', error);
  }

  return keys;
}
