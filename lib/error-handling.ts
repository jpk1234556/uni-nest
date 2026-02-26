// Comprehensive error handling system

export interface AppError {
  type: ErrorType
  code: string
  message: string
  statusCode?: number
  details?: any
  timestamp: Date
  stack?: string
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  path?: string
  method?: string
  userAgent?: string
  ip?: string
  additionalData?: Record<string, any>
}

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC'
}

// Custom error classes
export class ValidationError extends Error {
  public readonly type = ErrorType.VALIDATION
  public readonly code: string
  public readonly details: any

  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: any) {
    super(message)
    this.name = 'ValidationError'
    this.code = code
    this.details = details
  }
}

export class AuthenticationError extends Error {
  public readonly type = ErrorType.AUTHENTICATION
  public readonly code: string

  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthenticationError'
    this.code = code
  }
}

export class AuthorizationError extends Error {
  public readonly type = ErrorType.AUTHORIZATION
  public readonly code: string

  constructor(message: string = 'Access denied', code: string = 'ACCESS_DENIED') {
    super(message)
    this.name = 'AuthorizationError'
    this.code = code
  }
}

export class NotFoundError extends Error {
  public readonly type = ErrorType.NOT_FOUND
  public readonly code: string
  public readonly resource: string

  constructor(resource: string, code: string = 'NOT_FOUND') {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
    this.code = code
    this.resource = resource
  }
}

export class ConflictError extends Error {
  public readonly type = ErrorType.CONFLICT
  public readonly code: string
  public readonly details: any

  constructor(message: string, code: string = 'CONFLICT', details?: any) {
    super(message)
    this.name = 'ConflictError'
    this.code = code
    this.details = details
  }
}

export class RateLimitError extends Error {
  public readonly type = ErrorType.RATE_LIMIT
  public readonly code: string
  public readonly retryAfter?: number

  constructor(message: string = 'Rate limit exceeded', code: string = 'RATE_LIMIT', retryAfter?: number) {
    super(message)
    this.name = 'RateLimitError'
    this.code = code
    this.retryAfter = retryAfter
  }
}

export class ExternalServiceError extends Error {
  public readonly type = ErrorType.EXTERNAL_SERVICE
  public readonly code: string
  public readonly service: string
  public readonly originalError?: Error

  constructor(service: string, message: string, code: string = 'EXTERNAL_ERROR', originalError?: Error) {
    super(message)
    this.name = 'ExternalServiceError'
    this.code = code
    this.service = service
    this.originalError = originalError
  }
}

export class DatabaseError extends Error {
  public readonly type = ErrorType.DATABASE
  public readonly code: string
  public readonly query?: string
  public readonly originalError?: Error

  constructor(message: string, code: string = 'DATABASE_ERROR', query?: string, originalError?: Error) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.query = query
    this.originalError = originalError
  }
}

export class NetworkError extends Error {
  public readonly type = ErrorType.NETWORK
  public readonly code: string
  public readonly url?: string
  public readonly method?: string

  constructor(message: string, code: string = 'NETWORK_ERROR', url?: string, method?: string) {
    super(message)
    this.name = 'NetworkError'
    this.code = code
    this.url = url
    this.method = method
  }
}

export class BusinessLogicError extends Error {
  public readonly type = ErrorType.BUSINESS_LOGIC
  public readonly code: string
  public readonly details: any

  constructor(message: string, code: string = 'BUSINESS_ERROR', details?: any) {
    super(message)
    this.name = 'BusinessLogicError'
    this.code = code
    this.details = details
  }
}

// Error handler utility
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorCallbacks: Map<ErrorType, ((error: Error, context?: ErrorContext) => void)[]> = new Map()

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Register error callbacks
  onError(errorType: ErrorType, callback: (error: Error, context?: ErrorContext) => void): void {
    if (!this.errorCallbacks.has(errorType)) {
      this.errorCallbacks.set(errorType, [])
    }
    this.errorCallbacks.get(errorType)!.push(callback)
  }

  // Handle error
  handle(error: Error, context?: ErrorContext): AppError {
    const appError = this.createAppError(error)
    
    // Log error
    this.logError(appError, context)
    
    // Execute callbacks
    const callbacks = this.errorCallbacks.get(appError.type as ErrorType) || []
    callbacks.forEach(callback => {
      try {
        callback(error, context)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    })
    
    return appError
  }

  // Create standardized app error
  private createAppError(error: Error): AppError {
    const timestamp = new Date()
    
    if (error instanceof ValidationError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 400,
        type: error.type,
        details: error.details,
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof AuthenticationError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 401,
        type: error.type,
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof AuthorizationError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 403,
        type: error.type,
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof NotFoundError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 404,
        type: error.type,
        details: { resource: error.resource },
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof ConflictError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 409,
        type: error.type,
        details: error.details,
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof RateLimitError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 429,
        type: error.type,
        details: { retryAfter: error.retryAfter },
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof ExternalServiceError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 502,
        type: error.type,
        details: { service: error.service },
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof DatabaseError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 500,
        type: error.type,
        details: { query: error.query },
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof NetworkError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 503,
        type: error.type,
        details: { url: error.url, method: error.method },
        timestamp,
        stack: error.stack
      }
    }
    
    if (error instanceof BusinessLogicError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: 400,
        type: error.type,
        details: error.details,
        timestamp,
        stack: error.stack
      }
    }
    
    // Unknown error
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      type: ErrorType.INTERNAL,
      timestamp,
      stack: error.stack
    }
  }

  // Log error
  private logError(error: AppError, context?: ErrorContext): void {
    const logData = {
      ...error,
      context,
      environment: process.env.NODE_ENV || 'development'
    }
    
    if (process.env.NODE_ENV === 'production') {
      // In production, log to external service
      console.error(JSON.stringify(logData))
    } else {
      // In development, log with more details
      console.error('Error occurred:', {
        error: logData,
        context
      })
    }
  }
}

// Error boundary for React components
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundaryUtils {
  // Handle React error
  static handleReactError(error: Error, errorInfo: any, context?: ErrorContext): AppError {
    const appError = ErrorHandler.getInstance().handle(error, {
      ...context,
      additionalData: {
        ...context?.additionalData,
        reactErrorInfo: errorInfo
      }
    })
    
    return appError
  }

  // Create user-friendly error message
  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.'
      case ErrorType.AUTHENTICATION:
        return 'Please sign in to continue.'
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.'
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.'
      case ErrorType.CONFLICT:
        return 'This action conflicts with existing data.'
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please try again later.'
      case ErrorType.EXTERNAL_SERVICE:
        return 'A service is temporarily unavailable. Please try again later.'
      case ErrorType.DATABASE:
        return 'A database error occurred. Please try again later.'
      case ErrorType.NETWORK:
        return 'Network error. Please check your connection and try again.'
      case ErrorType.BUSINESS_LOGIC:
        return error.message
      default:
        return 'An unexpected error occurred. Please try again later.'
    }
  }

  // Get error severity
  static getErrorSeverity(error: AppError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.type) {
      case ErrorType.VALIDATION:
      case ErrorType.BUSINESS_LOGIC:
        return 'low'
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
      case ErrorType.NOT_FOUND:
      case ErrorType.CONFLICT:
        return 'medium'
      case ErrorType.RATE_LIMIT:
      case ErrorType.EXTERNAL_SERVICE:
      case ErrorType.NETWORK:
        return 'high'
      case ErrorType.DATABASE:
      case ErrorType.INTERNAL:
        return 'critical'
      default:
        return 'medium'
    }
  }
}

// Utility functions
export const createError = (type: ErrorType, message: string, code?: string, details?: any): Error => {
  switch (type) {
    case ErrorType.VALIDATION:
      return new ValidationError(message, code, details)
    case ErrorType.AUTHENTICATION:
      return new AuthenticationError(message, code)
    case ErrorType.AUTHORIZATION:
      return new AuthorizationError(message, code)
    case ErrorType.NOT_FOUND:
      return new NotFoundError(message, code)
    case ErrorType.CONFLICT:
      return new ConflictError(message, code, details)
    case ErrorType.RATE_LIMIT:
      return new RateLimitError(message, code, details?.retryAfter)
    case ErrorType.EXTERNAL_SERVICE:
      return new ExternalServiceError(details?.service || 'unknown', message, code, details?.originalError)
    case ErrorType.DATABASE:
      return new DatabaseError(message, code, details?.query, details?.originalError)
    case ErrorType.NETWORK:
      return new NetworkError(message, code, details?.url, details?.method)
    case ErrorType.BUSINESS_LOGIC:
      return new BusinessLogicError(message, code, details)
    default:
      return new Error(message)
  }
}

export const isRetryableError = (error: AppError): boolean => {
  return [
    ErrorType.EXTERNAL_SERVICE,
    ErrorType.NETWORK,
    ErrorType.DATABASE
  ].includes(error.type as ErrorType)
}

export const shouldShowToUser = (error: AppError): boolean => {
  return ![
    ErrorType.INTERNAL,
    ErrorType.DATABASE
  ].includes(error.type as ErrorType)
}

// Global error handler setup
export const setupGlobalErrorHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    ErrorHandler.getInstance().handle(error, {
      path: 'uncaughtException',
      method: 'process'
    })
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    ErrorHandler.getInstance().handle(error, {
      path: 'unhandledRejection',
      method: 'promise'
    })
  })
}
