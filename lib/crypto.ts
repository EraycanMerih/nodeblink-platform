import crypto from 'crypto'

const MASTER_KEY = process.env.NODEBLINK_ENC_KEY || ''
if (!MASTER_KEY) {
  console.warn('NODEBLINK_ENC_KEY not set - asset decryption will not work')
}

export function decryptBase64(encryptedBase64: string): string {
  if (!MASTER_KEY) throw new Error('Encryption master key not configured')
  const data = Buffer.from(encryptedBase64, 'base64')
  // first 12 bytes: iv, next: auth tag last 16, rest is ciphertext (we'll format as iv+cipher+tag)
  const iv = data.slice(0, 12)
  const tag = data.slice(data.length - 16)
  const ciphertext = data.slice(12, data.length - 16)

  const key = Buffer.from(MASTER_KEY, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

export function encryptBase64(plainText: string): string {
  if (!MASTER_KEY) throw new Error('Encryption master key not configured')
  const key = Buffer.from(MASTER_KEY, 'base64')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plainText, 'utf8')), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, ciphertext, tag]).toString('base64')
}
