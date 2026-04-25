'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Patient } from '@/types/patient.types'
import type { ImageQuality } from '@/types/case.types'
import { ROUTES } from '@/constants/routes'
import { useNotificationStore } from '@/store/notificationStore'

export type UploadStep =
  | 'select_patient'
  | 'upload_image'
  | 'quality_check'
  | 'processing'
  | 'complete'
  | 'error'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export interface UploadError {
  type: 'file_type' | 'file_size' | 'upload' | 'quality'
  message: string
}

export function useCaseUpload() {
  const router = useRouter()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [step, setStep] = useState<UploadStep>('select_patient')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<UploadError | null>(null)
  const [qualityResult, setQualityResult] = useState<ImageQuality | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Processing step tracker
  const [processingSteps, setProcessingSteps] = useState([
    { label: 'Image uploaded', status: 'pending' as 'pending' | 'active' | 'done' },
    { label: 'Preprocessing image', status: 'pending' as 'pending' | 'active' | 'done' },
    { label: 'Running AI models', status: 'pending' as 'pending' | 'active' | 'done' },
    { label: 'Generating report', status: 'pending' as 'pending' | 'active' | 'done' },
  ])

  const handleImageSelect = useCallback((file: File) => {
    setUploadError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError({
        type: 'file_type',
        message: 'Only JPEG and PNG images are accepted.',
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError({
        type: 'file_size',
        message: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
      })
      return
    }

    // Revoke previous URL
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setImageFile(file)
  }, [])

  const removeImage = useCallback(() => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl(null)
    setUploadError(null)
  }, [imagePreviewUrl])

  const simulateQualityCheck = useCallback((): Promise<ImageQuality> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 80% chance good quality, 20% random failure
        const rand = Math.random()
        if (rand < 0.8) resolve('good')
        else if (rand < 0.87) resolve('blurry')
        else if (rand < 0.94) resolve('poor_lighting')
        else resolve('overexposed')
      }, 2000)
    })
  }, [])

  const startProcessing = useCallback(async () => {
    setStep('processing')
    const newCaseId = `case-${String(Date.now()).slice(-6)}`
    setCaseId(newCaseId)

    // Simulate processing steps
    const stepDelays = [500, 1500, 2500, 1500]
    const newSteps: { label: string; status: 'pending' | 'active' | 'done' }[] = [
      { label: 'Image uploaded', status: 'done' },
      { label: 'Preprocessing image', status: 'pending' },
      { label: 'Running AI models', status: 'pending' },
      { label: 'Generating report', status: 'pending' },
    ]
    setProcessingSteps([...newSteps])

    for (let i = 1; i < newSteps.length; i++) {
      await new Promise((r) => setTimeout(r, stepDelays[i]))
      newSteps[i].status = 'active'
      setProcessingSteps([...newSteps])
      await new Promise((r) => setTimeout(r, stepDelays[i]))
      newSteps[i].status = 'done'
      setProcessingSteps([...newSteps])
    }

    // Complete
    setStep('complete')
    setIsUploading(false)

    addNotification({
      type: 'success',
      title: 'Analysis Complete',
      message: `Case ${newCaseId} has been analyzed and is ready for review.`,
    })

    // Auto-redirect after short delay
    setTimeout(() => {
      router.push(ROUTES.CASE_DETAIL('case-011'))
    }, 1200)
  }, [router, addNotification])

  const handleUpload = useCallback(async () => {
    if (!selectedPatient || !imageFile) return

    setIsUploading(true)
    setStep('quality_check')
    setQualityResult(null)

    try {
      // Simulate quality check
      const quality = await simulateQualityCheck()
      setQualityResult(quality)

      if (quality !== 'good') {
        setIsUploading(false)
        return // Stay on quality_check step — user can retake or proceed anyway
      }

      // Quality passed — go to processing
      await startProcessing()
    } catch {
      setUploadError({ type: 'upload', message: 'Upload failed. Please try again.' })
      setStep('error')
      setIsUploading(false)
    }
  }, [selectedPatient, imageFile, simulateQualityCheck, startProcessing])

  const proceedAnyway = useCallback(async () => {
    await startProcessing()
  }, [startProcessing])

  const retakeImage = useCallback(() => {
    removeImage()
    setQualityResult(null)
    setStep('upload_image')
  }, [removeImage])

  const goToStep = useCallback((newStep: UploadStep) => {
    setStep(newStep)
  }, [])

  return {
    step,
    setStep: goToStep,
    selectedPatient,
    setSelectedPatient,
    imageFile,
    imagePreviewUrl,
    uploadError,
    qualityResult,
    caseId,
    isUploading,
    processingSteps,
    handleImageSelect,
    handleUpload,
    removeImage,
    proceedAnyway,
    retakeImage,
  }
}
