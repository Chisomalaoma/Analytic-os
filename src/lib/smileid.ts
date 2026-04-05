const SIDCore = require('smile-identity-core')
const WebApi = SIDCore.WebApi

interface BiometricKYCData {
  idType: string
  idNumber: string
  firstName: string
  lastName: string
  dob?: string
  country: string
  userId: string
  jobId: string
  selfieImage?: string // base64
  livenessImages?: string[] // base64 array
}

export class SmileIDClient {
  private webApi: any
  private partnerId: string
  private callbackUrl: string
  private apiKey: string
  private sidServer: string

  constructor() {
    this.partnerId = process.env.SMILEID_PARTNER_ID || ''
    this.apiKey = process.env.SMILEID_API_KEY || ''
    this.callbackUrl = process.env.SMILEID_CALLBACK_URL || ''
    this.sidServer = process.env.SMILEID_SANDBOX === 'true' ? '0' : '1'

    if (!this.partnerId || !this.apiKey) {
      throw new Error('SmileID credentials not configured')
    }

    console.log('[SMILEID] Initializing with:', {
      partnerId: this.partnerId,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
      sidServer: this.sidServer,
      callbackUrl: this.callbackUrl,
    })

    this.webApi = new WebApi(
      this.partnerId,
      this.callbackUrl,
      this.apiKey,
      this.sidServer
    )
  }

  async submitBiometricKYC(data: BiometricKYCData): Promise<any> {
    try {
      console.log('[SMILEID] Submitting Biometric KYC:', {
        userId: data.userId,
        jobId: data.jobId,
        idType: data.idType,
        country: data.country,
      })

      // Prepare partner params
      const partner_params = {
        job_id: data.jobId,
        user_id: data.userId,
        job_type: 1, // Biometric KYC
      }

      // Prepare image array
      const image_details = []
      
      // Add selfie image (base64)
      if (data.selfieImage) {
        image_details.push({
          image_type_id: 2, // Selfie base64
          image: data.selfieImage,
        })
      }

      // Add liveness images (base64)
      if (data.livenessImages && data.livenessImages.length > 0) {
        data.livenessImages.forEach((image) => {
          image_details.push({
            image_type_id: 6, // Liveness base64
            image,
          })
        })
      }

      // Prepare ID info
      const id_info = {
        country: data.country,
        id_type: data.idType,
        id_number: data.idNumber,
        first_name: data.firstName,
        last_name: data.lastName,
        ...(data.dob && { dob: data.dob }),
        entered: 'true', // Must be string
      }

      // Options
      const options = {
        return_job_status: false,
        signature: true,
      }

      console.log('[SMILEID] Calling submit_job with:', {
        partner_params,
        image_count: image_details.length,
        id_info: { ...id_info, id_number: '***' },
      })

      // Submit job using the SDK
      const result = await this.webApi.submit_job(
        partner_params,
        image_details,
        id_info,
        options
      )

      console.log('[SMILEID] Job submitted successfully:', {
        success: result.success,
        smileJobId: result.smile_job_id,
        code: result.code,
      })

      return result
    } catch (error: any) {
      console.error('[SMILEID] Error submitting job:', error)
      throw new Error(error.message || 'Failed to submit KYC job')
    }
  }

  async getJobStatus(userId: string, jobId: string): Promise<any> {
    try {
      const partner_params = {
        job_id: jobId,
        user_id: userId,
      }

      const options = {
        return_history: true,
        return_image_links: true,
      }

      const result = await this.webApi.get_job_status(
        partner_params,
        options
      )
      return result
    } catch (error: any) {
      console.error('[SMILEID] Error getting job status:', error)
      throw new Error(error.message || 'Failed to get job status')
    }
  }
}

export const smileIDClient = new SmileIDClient()
