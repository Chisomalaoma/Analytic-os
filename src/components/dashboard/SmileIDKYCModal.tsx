'use client'

import { useState, useRef } from 'react'
import { X, Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react'

interface SmileIDKYCModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type KYCStep = 'id-selection' | 'id-details' | 'document-upload' | 'selfie-capture' | 'address' | 'processing' | 'success' | 'error'

type IDType = 'BVN' | 'NIN' | 'DRIVERS_LICENSE' | 'VOTER_ID' | 'PASSPORT'

export function SmileIDKYCModal({ open, onClose, onSuccess }: SmileIDKYCModalProps) {
  const [step, setStep] = useState<KYCStep>('id-selection')
  const [idType, setIdType] = useState<IDType | null>(null)
  const [idNumber, setIdNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [address, setAddress] = useState('')
  const [utilityNumber, setUtilityNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const documentInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const idTypes = [
    { value: 'BVN' as IDType, label: 'Bank Verification Number (BVN)', length: 11 },
    { value: 'NIN' as IDType, label: 'National Identity Number (NIN)', length: 11 },
    { value: 'DRIVERS_LICENSE' as IDType, label: 'Driver\'s License', length: null },
    { value: 'VOTER_ID' as IDType, label: 'Voter Card (PVC)', length: null },
    { value: 'PASSPORT' as IDType, label: 'International Passport', length: null },
  ]

  const handleIDTypeSelect = (type: IDType) => {
    setIdType(type)
    setStep('id-details')
  }

  const handleIDDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!idNumber || !firstName || !lastName) {
      setError('Please fill all required fields')
      return
    }
    setError('')
    setStep('document-upload')
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setDocumentFile(file)
      setError('')
    }
  }

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setSelfieFile(file)
      setError('')
    }
  }

  const handleDocumentNext = () => {
    if (!documentFile) {
      setError('Please upload your ID document')
      return
    }
    setError('')
    setStep('selfie-capture')
  }

  const handleSelfieNext = () => {
    if (!selfieFile) {
      setError('Please upload your selfie')
      return
    }
    setError('')
    setStep('address')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      setError('Please provide your address')
      return
    }

    setLoading(true)
    setError('')
    setStep('processing')

    try {
      const formData = new FormData()
      formData.append('idType', idType!)
      formData.append('idNumber', idNumber)
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('dob', dob)
      formData.append('address', address)
      formData.append('utilityNumber', utilityNumber)
      if (documentFile) formData.append('document', documentFile)
      if (selfieFile) formData.append('selfie', selfieFile)

      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit KYC')
      }

      setStep('success')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
    } catch (err: any) {
      console.error('[KYC-MODAL] Submission error:', err)
      setError(err.message || 'Failed to submit KYC. Please try again.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'id-selection':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Select your preferred ID type for verification
            </p>
            {idTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleIDTypeSelect(type.value)}
                className="w-full p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg text-left hover:border-[#4459FF] transition-colors"
              >
                <div className="text-white font-medium">{type.label}</div>
                {type.length && (
                  <div className="text-sm text-gray-400 mt-1">{type.length} digits</div>
                )}
              </button>
            ))}
          </div>
        )

      case 'id-details':
        return (
          <form onSubmit={handleIDDetailsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {idTypes.find(t => t.value === idType)?.label} Number *
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={`Enter your ${idType} number`}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF] [color-scheme:dark]"
                style={{
                  colorScheme: 'dark',
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Click the calendar icon to select your date of birth
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg transition-colors font-medium"
            >
              Continue
            </button>
          </form>
        )

      case 'document-upload':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Upload a clear photo of your {idTypes.find(t => t.value === idType)?.label}
            </p>

            <div
              onClick={() => documentInputRef.current?.click()}
              className="border-2 border-dashed border-[#262626] rounded-lg p-8 text-center cursor-pointer hover:border-[#4459FF] transition-colors"
            >
              {documentFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-white">{documentFile.name}</p>
                  <p className="text-sm text-gray-400">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-white">Click to upload document</p>
                  <p className="text-sm text-gray-400">JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>

            <input
              ref={documentInputRef}
              type="file"
              accept="image/*"
              onChange={handleDocumentUpload}
              className="hidden"
            />

            <button
              onClick={handleDocumentNext}
              disabled={!documentFile}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#4459FF]/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        )

      case 'selfie-capture':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Take a clear selfie for liveness verification
            </p>

            <div
              onClick={() => selfieInputRef.current?.click()}
              className="border-2 border-dashed border-[#262626] rounded-lg p-8 text-center cursor-pointer hover:border-[#4459FF] transition-colors"
            >
              {selfieFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-white">{selfieFile.name}</p>
                  <p className="text-sm text-gray-400">Click to retake</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-white">Click to capture selfie</p>
                  <p className="text-sm text-gray-400">JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>

            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleSelfieUpload}
              className="hidden"
            />

            <div className="text-xs text-gray-500 mt-2">
              On mobile: Opens camera automatically<br/>
              On desktop: Upload a selfie photo
            </div>

            <button
              onClick={handleSelfieNext}
              disabled={!selfieFile}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#4459FF]/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        )

      case 'address':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full residential address"
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF] resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Utility Number (Optional)
              </label>
              <input
                type="text"
                value={utilityNumber}
                onChange={(e) => setUtilityNumber(e.target.value)}
                placeholder="Electricity meter number"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF]"
              />
              <p className="text-xs text-gray-500 mt-1">
                For address verification (PHEDC, IKEDC, EKEDC, etc.)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#4459FF]/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        )

      case 'processing':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-[#4459FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Processing Your KYC</h3>
            <p className="text-gray-400">
              Please wait while we verify your information...
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">KYC Submitted Successfully!</h3>
            <p className="text-gray-400">
              Your verification is being processed. You'll be notified once it's complete.
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Verification Failed</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => setStep('id-selection')}
              className="px-6 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-md border border-[#262626] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#262626] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-xl font-semibold text-white">KYC Verification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && step !== 'error' && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  )
}
