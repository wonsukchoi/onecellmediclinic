import { useState, useCallback } from 'react'

type ValidationFunction<T> = (values: T) => Partial<Record<keyof T, string>>

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  handleChange: (field: keyof T, value: any) => void
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>
  reset: () => void
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validate?: ValidationFunction<T>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))

    if (validate) {
      const newValues = { ...values, [field]: value }
      const newErrors = validate(newValues)
      setErrors(newErrors)
    }
  }, [values, validate])

  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault()

      if (validate) {
        const validationErrors = validate(values)
        setErrors(validationErrors)

        const allFieldsTouched = Object.keys(values).reduce((acc, field) => ({
          ...acc,
          [field]: true
        }), {} as Partial<Record<keyof T, boolean>>)
        setTouched(allFieldsTouched)

        if (Object.keys(validationErrors).length > 0) {
          return
        }
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  }
}