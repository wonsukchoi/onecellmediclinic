import { v4 as uuidv4 } from 'uuid'

export interface ErrorContext {
  context?: string
  userId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  errorInfo?: any
  componentStack?: string
  errorBoundary?: boolean
  manual?: boolean
  retryCount?: number
  apiEndpoint?: string
  httpStatus?: number
  responseData?: any
  [key: string]: any
}

export interface ErrorReport {
  id: string
  message: string
  stack?: string
  name: string
  context: ErrorContext
  timestamp: string
  level: 'error' | 'warn' | 'info'
}

class ErrorLoggerService {
  private errors: ErrorReport[] = []
  private maxErrors = 100
  private isDevelopment = process.env.NODE_ENV === 'development'

  logError(error: Error, context: ErrorContext = {}): string {
    const id = uuidv4()
    const timestamp = new Date().toISOString()

    const errorReport: ErrorReport = {
      id,
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp
      },
      timestamp,
      level: 'error'
    }

    this.addError(errorReport)
    this.consoleLog(errorReport)

    // In production, you might want to send to external logging service
    if (!this.isDevelopment) {
      this.sendToLoggingService(errorReport).catch(err => {
        console.warn('Failed to send error to logging service:', err)
      })
    }

    return id
  }

  logWarning(message: string, context: ErrorContext = {}): string {
    return this.logError(new Error(message), { ...context, level: 'warn' })
  }

  logInfo(message: string, context: ErrorContext = {}): string {
    return this.logError(new Error(message), { ...context, level: 'info' })
  }

  private addError(errorReport: ErrorReport) {
    this.errors.unshift(errorReport)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
  }

  private consoleLog(errorReport: ErrorReport) {
    const { level } = errorReport
    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info

    logMethod(`[${level.toUpperCase()}] ${errorReport.message}`, {
      id: errorReport.id,
      context: errorReport.context,
      stack: errorReport.stack
    })
  }

  private async sendToLoggingService(errorReport: ErrorReport): Promise<void> {
    try {
      // Example implementation - replace with your actual logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })

      // For now, just store in localStorage as fallback
      const storedErrors = this.getStoredErrors()
      storedErrors.unshift(errorReport)

      // Keep only last 50 errors in storage
      const limitedErrors = storedErrors.slice(0, 50)
      localStorage.setItem('error_logs', JSON.stringify(limitedErrors))
    } catch (err) {
      console.warn('Failed to store error log:', err)
    }
  }

  private getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('error_logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  getRecentErrors(limit = 10): ErrorReport[] {
    return this.errors.slice(0, limit)
  }

  getAllErrors(): ErrorReport[] {
    return [...this.errors]
  }

  clearErrors(): void {
    this.errors = []
    localStorage.removeItem('error_logs')
  }

  // Get error statistics
  getErrorStats() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour

    const recentErrors = this.errors.filter(
      error => now - new Date(error.timestamp).getTime() < oneHour
    )

    const todayErrors = this.errors.filter(
      error => now - new Date(error.timestamp).getTime() < oneDay
    )

    const errorsByContext = this.errors.reduce((acc, error) => {
      const context = error.context.context || 'Unknown'
      acc[context] = (acc[context] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: this.errors.length,
      lastHour: recentErrors.length,
      today: todayErrors.length,
      byContext: errorsByContext
    }
  }

  // Download error logs as JSON file for debugging
  downloadErrorLogs(): void {
    const allErrors = [...this.errors, ...this.getStoredErrors()]
    const dataStr = JSON.stringify(allErrors, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const ErrorLogger = new ErrorLoggerService()

// Global error handlers
window.addEventListener('error', (event) => {
  ErrorLogger.logError(event.error || new Error(event.message), {
    context: 'window.error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  ErrorLogger.logError(error, {
    context: 'unhandledrejection',
    reason: event.reason
  })
})

// Performance monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (perfData) {
        const loadTime = perfData.loadEventEnd - perfData.fetchStart
        if (loadTime > 5000) { // Log slow loads > 5 seconds
          ErrorLogger.logWarning('Slow page load detected', {
            context: 'performance',
            loadTime,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
            resourcesLoaded: perfData.loadEventEnd - perfData.domContentLoadedEventEnd
          })
        }
      }
    }, 0)
  })
}