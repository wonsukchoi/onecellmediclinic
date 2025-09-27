import React, { useState, useCallback, useRef } from 'react'
import { ErrorLogger } from '../utils/error-logger'

export interface ApiCallOptions {
  retryCount?: number
  retryDelay?: number
  maxRetryDelay?: number
  exponentialBackoff?: boolean
  timeout?: number
  abortOnUnmount?: boolean
  onError?: (error: Error, attempt: number) => void
  onRetry?: (attempt: number, delay: number) => void
  shouldRetry?: (error: Error, attempt: number) => boolean
}

export interface ApiCallResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T | null>
  abort: () => void
  retry: () => Promise<T | null>
  reset: () => void
}

const DEFAULT_OPTIONS: Required<ApiCallOptions> = {
  retryCount: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  exponentialBackoff: true,
  timeout: 30000,
  abortOnUnmount: true,
  onError: () => {},
  onRetry: () => {},
  shouldRetry: (error: Error, attempt: number) => {
    // Don't retry on 4xx errors (client errors)
    if (error.message.includes('400') || error.message.includes('401') ||
        error.message.includes('403') || error.message.includes('404')) {
      return false
    }
    return attempt < 3
  }
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
): ApiCallResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const lastArgsRef = useRef<any[]>([])
  const mountedRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const config = { ...DEFAULT_OPTIONS, ...options }

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Sleep function for delays
  const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms))

  // Calculate delay with exponential backoff
  const calculateDelay = (attempt: number): number => {
    if (!config.exponentialBackoff) {
      return config.retryDelay
    }

    const delay = config.retryDelay * Math.pow(2, attempt - 1)
    return Math.min(delay, config.maxRetryDelay)
  }

  // Main execute function with retry logic
  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Store args for retry
    lastArgsRef.current = args

    // Clean up any previous request
    cleanup()

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= config.retryCount + 1; attempt++) {
      try {
        // Check if component is still mounted
        if (!mountedRef.current) {
          return null
        }

        // Set up timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error(`Request timeout after ${config.timeout}ms`))
          }, config.timeout)
        })

        // Execute API call with timeout
        const apiPromise = apiFunction(...args)
        const result = await Promise.race([apiPromise, timeoutPromise])

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Success - update state and return
        if (mountedRef.current) {
          setData(result)
          setLoading(false)
          setError(null)
        }

        return result

      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        lastError = error

        // Log error with context
        ErrorLogger.logError(error, {
          context: 'useApiCall',
          attempt,
          maxAttempts: config.retryCount + 1,
          apiFunction: apiFunction.name,
          args: JSON.stringify(args)
        })

        // Call custom error handler
        config.onError(error, attempt)

        // Check if we should retry
        const shouldRetry = attempt <= config.retryCount &&
                           config.shouldRetry(error, attempt) &&
                           mountedRef.current

        if (!shouldRetry) {
          break
        }

        // Calculate delay and wait
        const delay = calculateDelay(attempt)
        config.onRetry(attempt, delay)

        await sleep(delay)

        // Check abort signal
        if (abortControllerRef.current?.signal.aborted) {
          break
        }
      }
    }

    // All attempts failed
    if (mountedRef.current) {
      const errorMessage = lastError?.message || 'API call failed'
      setError(errorMessage)
      setLoading(false)
    }

    return null
  }, [apiFunction, config, cleanup])

  // Abort current request
  const abort = useCallback(() => {
    cleanup()
    setLoading(false)
    setError('Request aborted')
  }, [cleanup])

  // Retry with last used arguments
  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgsRef.current.length === 0) {
      throw new Error('No previous arguments to retry with')
    }
    return execute(...lastArgsRef.current)
  }, [execute])

  // Reset state
  const reset = useCallback(() => {
    cleanup()
    setData(null)
    setLoading(false)
    setError(null)
    lastArgsRef.current = []
  }, [cleanup])

  // Cleanup on unmount
  React.useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      if (config.abortOnUnmount) {
        cleanup()
      }
    }
  }, [cleanup, config.abortOnUnmount])

  return {
    data,
    loading,
    error,
    execute,
    abort,
    retry,
    reset
  }
}

// Specialized hook for common CRUD operations
export function useCrudApi<T = any>(baseUrl: string, options: ApiCallOptions = {}) {
  const get = useApiCall(
    async (id?: string | number) => {
      const url = id ? `${baseUrl}/${id}` : baseUrl
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    options
  )

  const post = useApiCall(
    async (data: Partial<T>) => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error(`POST ${baseUrl} failed: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    options
  )

  const put = useApiCall(
    async (id: string | number, data: Partial<T>) => {
      const url = `${baseUrl}/${id}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error(`PUT ${url} failed: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    options
  )

  const del = useApiCall(
    async (id: string | number) => {
      const url = `${baseUrl}/${id}`
      const response = await fetch(url, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(`DELETE ${url} failed: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    options
  )

  return { get, post, put, delete: del }
}

// Hook for handling form submissions with error recovery
export function useFormSubmission<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: ApiCallOptions = {}
) {
  const apiCall = useApiCall(submitFunction, {
    retryCount: 1, // Usually don't want to retry form submissions multiple times
    ...options
  })

  const submit = useCallback(async (formData: any) => {
    try {
      return await apiCall.execute(formData)
    } catch (error) {
      // Handle form-specific error logic here
      throw error
    }
  }, [apiCall])

  return {
    ...apiCall,
    submit
  }
}