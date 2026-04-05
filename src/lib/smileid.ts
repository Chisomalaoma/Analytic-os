import crypto from 'crypto'

interface SmileIDConfig {
  partnerId: string
  apiKey: string
  callbackUrl: string
  sandbox: boolean
}

interface PrepUploadRequest {
  smile_client_id: string
  partner_params: {
    job_id: string
    job_type: number
    user_id: string
  }
  callback_url: string
  source_sdk: string
  source_sdk_version: string
  timestamp: string
  signature: string
}

interface BiometricKYCData {
  idType: string
  idNumber: string
  firstName: string
  lastName: string
  dob?: string
  country: string
  userId: string
  jobId: string
}

export class SmileIDClient {
  private config: SmileIDConfig

  constructor() {
    this.config = {
      partnerId: process.env.SMILEID_PARTNER_ID || '',
      apiKey: process.env.SMILEID_API_KEY || '',
      callbackUrl: process.env.SMILEID_CALLBACK_URL || '',
      sandbox: process.env.SMILEID_SANDBOX === 'true',
    }

    if (!this.config.partnerId || !this.config.apiKey) {
      throw new Error('SmileID credentials not configured')
    }
  }

  private getBaseUrl(): string {
    return this.config.sandbox
      ? 'https://testapi.smileidentity.com/v1'
      : 'https://api.smileidentity.com/v1'
  }

  private generateSignature(timestamp: string): string {
    // SmileID signature: HMAC-SHA256 with separate updates, then base64 encode
    // Reference: https://docs.usesmileid.com/integration-options/rest-api/signing-your-api-request/generate-signature
    const hmac = crypto.createHmac('sha256', this.config.apiKey)
    hmac.update(timestamp, 'utf8')
    hmac.update(this.config.partnerId, 'utf8')
    hmac.update('sid_request', 'utf8')
    
    const signature = hmac.digest().toString('base64')
    
    console.log('[SMILEID] Signature generated:', {
      timestamp,
      partnerId: this.config.partnerId,
      signaturePrefix: signature.substring(0, 20) + '...'
    })
    
    return signature
  }

  async prepareUpload(data: BiometricKYCData): Promise<any> {
    const timestamp = new Date().toISOString()
    const signature = this.generateSignature(timestamp)

    const payload: PrepUploadRequest = {
      smile_client_id: this.config.partnerId,
      partner_params: {
        job_id: data.jobId,
        job_type: 1, // Biometric KYC
        user_id: data.userId,
      },
      callback_url: this.config.callbackUrl,
      source_sdk: 'rest_api',
      source_sdk_version: '1.0.0',
      timestamp,
      signature,
    }

    console.log('[SMILEID] Prepare upload request:', {
      url: `${this.getBaseUrl()}/upload`,
      partnerId: this.config.partnerId,
      sandbox: this.config.sandbox,
    })

    const response = await fetch(`${this.getBaseUrl()}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('[SMILEID] Response status:', response.status)
    console.log('[SMILEID] Response body:', responseText)

    if (!response.ok) {
      let error
      try {
        error = JSON.parse(responseText)
      } catch {
        throw new Error(`SmileID API error (${response.status}): ${responseText}`)
      }
      throw new Error(error.error || error.message || 'Failed to prepare upload')
    }

    return JSON.parse(responseText)
  }

  async uploadJob(
    uploadUrl: string,
    zipBuffer: Buffer
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/zip',
      },
      body: zipBuffer,
    })

    if (!response.ok) {
      throw new Error('Failed to upload job data')
    }
  }

  async getJobStatus(userId: string, jobId: string): Promise<any> {
    const timestamp = new Date().toISOString()
    const signature = this.generateSignature(timestamp)

    const params = new URLSearchParams({
      user_id: userId,
      job_id: jobId,
      partner_id: this.config.partnerId,
      timestamp,
      signature,
    })

    const response = await fetch(
      `${this.getBaseUrl()}/job_status?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get job status')
    }

    return response.json()
  }

  async verifyAddress(data: {
    country: string
    address: string
    fullName: string
    utilityNumber?: string
    utilityProvider?: string
    utilityType?: string
    userId: string
    jobId: string
  }): Promise<any> {
    const timestamp = new Date().toISOString()
    const signature = this.generateSignature(timestamp)

    const payload = {
      country: data.country,
      address: data.address,
      full_name: data.fullName,
      utility_number: data.utilityNumber,
      utility_provider: data.utilityProvider,
      utility_type: data.utilityType,
      callback_url: this.config.callbackUrl,
      partner_params: {
        user_id: data.userId,
        job_id: data.jobId,
      },
      partner_id: this.config.partnerId,
      timestamp,
      signature,
    }

    const response = await fetch(
      `${this.getBaseUrl().replace('/v1', '/v2')}/async-verify-address`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'smileid-partner-id': this.config.partnerId,
          'smileid-request-signature': signature,
          'smileid-timestamp': timestamp,
          'smileid-source-sdk': 'rest_api',
          'smileid-source-sdk-version': '1.0.0',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to verify address')
    }

    return response.json()
  }
}

export const smileIDClient = new SmileIDClient()
