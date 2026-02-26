"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { ErrorBoundaryUtils, AppError } from '../../lib/error-handling'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>
  onError?: (error: AppError) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: AppError
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Convert error to AppError
    const appError: AppError = {
      type: 'INTERNAL' as any,
      code: 'REACT_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date(),
      stack: error.stack
    }

    return { hasError: true, error: appError }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const appError = ErrorBoundaryUtils.handleReactError(error, errorInfo)
    
    this.setState({ error: appError })
    
    // Call custom error handler if provided
    this.props.onError?.(appError)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('React Error Boundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({ hasError: false, error: undefined })
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      // Use default fallback
      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

// Default error fallback component
interface DefaultErrorFallbackProps {
  error: AppError
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  const canRetry = ErrorBoundaryUtils.getErrorSeverity(error) !== 'critical'
  const userMessage = ErrorBoundaryUtils.getUserFriendlyMessage(error)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            {userMessage}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                <div><strong>Type:</strong> {error.type}</div>
                <div><strong>Code:</strong> {error.code}</div>
                <div><strong>Message:</strong> {error.message}</div>
                <div><strong>Timestamp:</strong> {error.timestamp.toISOString()}</div>
                {error.details && (
                  <div><strong>Details:</strong> {JSON.stringify(error.details, null, 2)}</div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canRetry && (
              <button
                onClick={retry}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact our support team.
            </p>
            <p className="text-sm text-gray-500">
              Error ID: {error.code}-{error.timestamp.getTime()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>,
  onError?: (error: AppError) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const handleError = (error: Error, context?: any) => {
    const appError = ErrorBoundaryUtils.handleReactError(error, context || {})
    
    // Log error
    console.error('Error handled by useErrorHandler:', appError)
    
    return appError
  }

  return { handleError }
}
