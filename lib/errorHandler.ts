/**
 * Comprehensive Error Handling Utilities
 */

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class ErrorHandler {
  /**
   * Handle Firebase errors
   */
  static handleFirebaseError(error: any): AppError {
    const errorCode = error.code || 'unknown';
    const errorMessage = error.message || 'An unknown error occurred';

    switch (errorCode) {
      case 'auth/user-not-found':
        return {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'No account found with this email address',
          statusCode: 404,
        };
      case 'auth/wrong-password':
        return {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          statusCode: 401,
        };
      case 'auth/email-already-in-use':
        return {
          code: 'AUTH_EMAIL_EXISTS',
          message: 'An account with this email already exists',
          statusCode: 409,
        };
      case 'auth/weak-password':
        return {
          code: 'AUTH_WEAK_PASSWORD',
          message: 'Password should be at least 6 characters',
          statusCode: 400,
        };
      case 'permission-denied':
        return {
          code: 'FIRESTORE_PERMISSION_DENIED',
          message: 'You do not have permission to perform this action',
          statusCode: 403,
        };
      default:
        return {
          code: 'FIREBASE_ERROR',
          message: errorMessage,
          statusCode: 500,
          details: errorCode,
        };
    }
  }

  /**
   * Handle Stripe errors
   */
  static handleStripeError(error: any): AppError {
    const errorType = error.type || 'unknown';

    switch (errorType) {
      case 'card_error':
        return {
          code: 'STRIPE_CARD_ERROR',
          message: error.message || 'Card was declined',
          statusCode: 400,
        };
      case 'invalid_request_error':
        return {
          code: 'STRIPE_INVALID_REQUEST',
          message: 'Invalid payment request',
          statusCode: 400,
          details: error.message,
        };
      case 'api_connection_error':
        return {
          code: 'STRIPE_CONNECTION_ERROR',
          message: 'Payment service temporarily unavailable',
          statusCode: 503,
        };
      default:
        return {
          code: 'STRIPE_ERROR',
          message: 'Payment processing failed',
          statusCode: 500,
          details: error.message,
        };
    }
  }

  /**
   * Handle API errors
   */
  static handleApiError(error: any): AppError {
    if (error.response) {
      // Server responded with error status
      return {
        code: 'API_ERROR',
        message: error.response.data?.message || 'API request failed',
        statusCode: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - please check your connection',
        statusCode: 0,
      };
    } else {
      // Something else happened
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        statusCode: 500,
      };
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any): AppError {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Please check your input and try again',
      statusCode: 400,
      details: error.errors || error.message,
    };
  }

  /**
   * Generic error handler
   */
  static handleError(error: any): AppError {
    console.error('Error handled:', error);

    // Check error type and delegate to specific handlers
    if (error.code && error.code.startsWith('auth/')) {
      return this.handleFirebaseError(error);
    }

    if (error.type && ['card_error', 'invalid_request_error', 'api_connection_error'].includes(error.type)) {
      return this.handleStripeError(error);
    }

    if (error.response || error.request) {
      return this.handleApiError(error);
    }

    if (error.name === 'ZodError') {
      return this.handleValidationError(error);
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      details: error,
    };
  }

  /**
   * Log error for monitoring
   */
  static logError(error: AppError, context?: any) {
    console.error('Application Error:', {
      ...error,
      context,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to error monitoring service (e.g., Sentry)
  }
}

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const appError = ErrorHandler.handleError(error);
    ErrorHandler.logError(appError, context);
    return appError;
  };

  return { handleError };
}