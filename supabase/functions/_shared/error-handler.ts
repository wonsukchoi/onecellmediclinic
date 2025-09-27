import { corsHeaders } from './cors.ts'

interface DatabaseError {
  message: string
  hint?: string
  details?: string
  code?: string
}

interface ErrorResponse {
  error: string
  code?: string
  details?: string
  hint?: string
  documentation?: string
}

/**
 * Checks if an error is due to a missing table
 */
export function isMissingTableError(error: DatabaseError): boolean {
  return (
    error.message?.includes('relation') && error.message?.includes('does not exist')
  ) || (
    error.code === '42P01' // undefined_table error code
  )
}

/**
 * Checks if an error is due to a missing function
 */
export function isMissingFunctionError(error: DatabaseError): boolean {
  return (
    error.message?.includes('function') && error.message?.includes('does not exist')
  ) || (
    error.code === '42883' // undefined_function error code
  )
}

/**
 * Creates a standardized error response for missing database resources
 */
export function createMissingResourceResponse(tableName: string, functionName?: string): Response {
  const errorResponse: ErrorResponse = {
    error: `Database not ready: Missing ${functionName ? 'function' : 'table'}`,
    code: 'DATABASE_NOT_READY',
    details: functionName
      ? `The function '${functionName}' does not exist in the database.`
      : `The table '${tableName}' does not exist in the database.`,
    hint: 'Please run the database setup scripts to create the required tables and functions.',
    documentation: 'Execute the SQL script at /scripts/features-schema.sql in your Supabase SQL Editor'
  }

  return new Response(JSON.stringify(errorResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 503 // Service Unavailable - temporary condition
  })
}

/**
 * Creates a standardized error response for general database errors
 */
export function createDatabaseErrorResponse(error: DatabaseError): Response {
  console.error('Database error:', error)

  const errorResponse: ErrorResponse = {
    error: 'Database error occurred',
    code: error.code || 'DATABASE_ERROR',
    details: error.message,
    hint: error.hint
  }

  return new Response(JSON.stringify(errorResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500
  })
}

/**
 * Creates a standardized error response for general application errors
 */
export function createGenericErrorResponse(error: any, functionName: string): Response {
  console.error(`Error in ${functionName} function:`, error)

  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: error.message || 'An unexpected error occurred'
  }

  return new Response(JSON.stringify(errorResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500
  })
}

/**
 * Main error handler that routes to appropriate response based on error type
 */
export function handleDatabaseError(error: any, tableName: string, functionName: string): Response {
  // Check if it's a missing table/function error
  if (isMissingTableError(error)) {
    return createMissingResourceResponse(tableName)
  }

  if (isMissingFunctionError(error)) {
    const funcName = error.message?.match(/function (.+?) does not exist/)?.[1]
    return createMissingResourceResponse(tableName, funcName)
  }

  // Check if it's a database-related error
  if (error.code || error.hint || (error.message && typeof error.message === 'string')) {
    return createDatabaseErrorResponse(error)
  }

  // Generic error fallback
  return createGenericErrorResponse(error, functionName)
}