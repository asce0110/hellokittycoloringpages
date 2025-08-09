// Cloudflare R2 Storage Configuration
// Using fetch-based approach to avoid WebAssembly issues with AWS SDK

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'ai-kitty-creator'

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

/**
 * Upload file to Cloudflare R2 (client-side version)
 */
export async function uploadToR2(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Check if R2 is configured
    if (!isR2Configured()) {
      console.log('R2 not configured, using simulation mode')
      return simulateUpload(file, folder)
    }

    // Create FormData for multipart upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    // Upload using the main upload API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed')
    }

    return {
      success: true,
      url: result.url,
      key: result.key
    }
  } catch (error) {
    console.error('R2 Upload Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Simulate upload when R2 is not configured
 */
async function simulateUpload(file: File, folder: string): Promise<UploadResult> {
  console.log('R2 Upload simulation for:', file.name)
  
  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = file.name.split('.').pop()
  const fileName = `${timestamp}-${randomString}.${fileExtension}`
  const key = `${folder}/${fileName}`

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Generate public URL (fallback to local path)
  const publicUrl = `/uploads/${fileName}`

  return {
    success: true,
    url: publicUrl,
    key: key
  }
}

/**
 * Generate presigned URL for uploading (alternative method)
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  // Temporarily disabled - returning placeholder
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${folder}/${fileName}`
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    // Temporarily simulate delete operation
    console.log('R2 Delete simulation for:', key)
    return true
  } catch (error) {
    console.error('R2 Delete Error:', error)
    return false
  }
}

/**
 * Server-side R2 upload using direct HTTP request with AWS Signature V4
 */
export async function uploadToR2Server(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Check if R2 is configured
    if (!isR2Configured()) {
      throw new Error('R2 not configured')
    }

    const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT!
    const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
    const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
    const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!
    const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`
    const key = `${folder}/${uniqueFileName}`

    // Create upload URL
    const uploadUrl = `${R2_ENDPOINT}/${BUCKET_NAME}/${key}`
    
    // Prepare headers for AWS Signature V4
    const date = new Date()
    const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStamp = date.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z'
    
    const headers = {
      'Host': new URL(R2_ENDPOINT).host,
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'X-Amz-Date': timeStamp,
      'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
    }

    // Create canonical request
    const canonicalUri = `/${BUCKET_NAME}/${key}`
    const canonicalQuerystring = ''
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key as keyof typeof headers]}`)
      .join('\n') + '\n'
    const signedHeaders = Object.keys(headers)
      .map(key => key.toLowerCase())
      .sort()
      .join(';')

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD'
    ].join('\n')

    // Create string to sign
    const credentialScope = `${dateStamp}/auto/s3/aws4_request`
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timeStamp,
      credentialScope,
      require('crypto').createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n')

    // Calculate signature
    const crypto = require('crypto')
    const kDate = crypto.createHmac('sha256', `AWS4${SECRET_ACCESS_KEY}`).update(dateStamp).digest()
    const kRegion = crypto.createHmac('sha256', kDate).update('auto').digest()
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest()
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

    // Create authorization header
    const authorization = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    // Upload to R2
    console.log('R2 Upload Details:', {
      uploadUrl,
      bucketName: BUCKET_NAME,
      key,
      endpoint: R2_ENDPOINT
    })

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Authorization': authorization
      },
      body: new Uint8Array(fileBuffer)
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('R2 Upload Failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        errorText,
        bucketName: BUCKET_NAME,
        endpoint: R2_ENDPOINT
      })
      throw new Error(`R2 upload failed: ${uploadResponse.status} ${errorText}`)
    }

    // Generate public URL
    const publicUrl = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `${R2_ENDPOINT}/${BUCKET_NAME}/${key}`

    return {
      success: true,
      url: publicUrl,
      key: key
    }
  } catch (error) {
    console.error('Server R2 Upload Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Check if R2 is properly configured
 */
export function isR2Configured(): boolean {
  const hasAllVars = !!(
    process.env.CLOUDFLARE_R2_ENDPOINT &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME
  )
  
  // 检查Access Key长度是否正确（AWS S3兼容格式）
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
  const hasValidKeyLength = accessKey.length >= 16 && accessKey.length <= 32
  
  return hasAllVars && hasValidKeyLength
}