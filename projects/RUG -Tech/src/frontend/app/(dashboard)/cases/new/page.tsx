'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Card, CardContent } from '@/Components/ui/Card'
import { useCaseUpload } from '@/features/cases/hooks/useCaseUpload'
import { PatientSelector } from '@/features/cases/components/PatientSelector'
import { CaseUploadZone } from '@/features/cases/components/CaseUploadZone'
import { ImageQualityFeedback } from '@/features/cases/components/ImageQualityFeedback'
import { StepIndicator } from '@/features/cases/components/StepIndicator'
import { ProcessingView } from '@/features/cases/components/ProcessingView'

const STEPS = ['Patient', 'Upload', 'Quality', 'Processing']

const stepIndex = {
  select_patient: 0,
  upload_image: 1,
  quality_check: 2,
  processing: 3,
  complete: 3,
  error: 2,
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
}

export default function CaseNewPage() {
  const upload = useCaseUpload()
  const currentIndex = stepIndex[upload.step]

  return (
    <div>
      <PageHeader
        title="Upload New Case"
        breadcrumbs={[
          { label: 'Cases', href: '/cases' },
          { label: 'Upload' },
        ]}
      />

      {/* Step indicator */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentIndex}
        className="mt-2 mb-8"
      />

      {/* Step content */}
      <Card className="max-w-2xl mx-auto overflow-hidden">
        <CardContent className="p-6">
          <AnimatePresence mode="wait" custom={1}>
            {/* Step 1: Select Patient */}
            {upload.step === 'select_patient' && (
              <motion.div
                key="select_patient"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 className="font-display text-lg text-[var(--text-primary)] mb-1">
                  Select Patient
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Choose the patient for this fundus image analysis.
                </p>

                <PatientSelector
                  selectedPatient={upload.selectedPatient}
                  onSelect={(p) => upload.setSelectedPatient(p)}
                  onClear={() => upload.setSelectedPatient(null)}
                />

                <div className="flex justify-end mt-8">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight size={14} />}
                    disabled={!upload.selectedPatient}
                    onClick={() => upload.setStep('upload_image')}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload Image */}
            {upload.step === 'upload_image' && (
              <motion.div
                key="upload_image"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 className="font-display text-lg text-[var(--text-primary)] mb-1">
                  Upload Fundus Image
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Upload a retinal fundus photograph for AI analysis.
                </p>

                <CaseUploadZone
                  imageFile={upload.imageFile}
                  imagePreviewUrl={upload.imagePreviewUrl}
                  patientName={upload.selectedPatient?.fullName}
                  error={upload.uploadError?.message}
                  onFileSelect={upload.handleImageSelect}
                  onRemove={upload.removeImage}
                />

                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="ghost"
                    size="md"
                    leftIcon={<ArrowLeft size={14} />}
                    onClick={() => upload.setStep('select_patient')}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight size={14} />}
                    disabled={!upload.imageFile}
                    loading={upload.isUploading}
                    onClick={upload.handleUpload}
                  >
                    Upload & Analyze
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Quality Check */}
            {upload.step === 'quality_check' && (
              <motion.div
                key="quality_check"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 className="font-display text-lg text-[var(--text-primary)] mb-1">
                  Image Quality Check
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Verifying the image meets clinical quality standards.
                </p>

                <ImageQualityFeedback
                  quality={upload.qualityResult}
                  isChecking={upload.qualityResult === null}
                  onRetake={upload.retakeImage}
                  onProceedAnyway={upload.proceedAnyway}
                  onProceed={upload.proceedAnyway}
                />
              </motion.div>
            )}

            {/* Step 4: Processing */}
            {(upload.step === 'processing' || upload.step === 'complete') && (
              <motion.div
                key="processing"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ProcessingView
                  caseId={upload.caseId}
                  steps={upload.processingSteps}
                  isComplete={upload.step === 'complete'}
                />
              </motion.div>
            )}

            {/* Error */}
            {upload.step === 'error' && (
              <motion.div
                key="error"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="flex flex-col items-center gap-4 py-12">
                  <p className="text-sm text-[var(--sev-critical)]">
                    {upload.uploadError?.message ?? 'Something went wrong.'}
                  </p>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => upload.setStep('upload_image')}
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
