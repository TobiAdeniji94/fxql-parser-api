/**
 * FXQL Error Code Taxonomy
 * Provides granular error identification for client handling
 */

export enum FxqlErrorCode {
  // Success
  SUCCESS = 'FXQL-200',

  // Validation Errors (400-series)
  BAD_REQUEST = 'FXQL-400',
  INVALID_FORMAT = 'FXQL_E_INVALID_FORMAT',
  INVALID_CURRENCY = 'FXQL_E_BAD_ISO',
  INVALID_PRICE = 'FXQL_E_PRICE_OUT_OF_RANGE',
  INVALID_CAP = 'FXQL_E_CAP_OUT_OF_RANGE',
  EMPTY_STATEMENT = 'FXQL_E_EMPTY_STATEMENT',
  EXCEEDS_MAX_PAIRS = 'FXQL_E_EXCEEDS_MAX_PAIRS',
  MALFORMED_SYNTAX = 'FXQL_E_MALFORMED_SYNTAX',

  // Authentication & Authorization Errors
  UNAUTHORIZED = 'FXQL-401',
  FORBIDDEN = 'FXQL-403',
  INVALID_API_KEY = 'FXQL_E_INVALID_API_KEY',
  MISSING_API_KEY = 'FXQL_E_MISSING_API_KEY',
  API_KEY_NOT_CONFIGURED = 'FXQL_E_API_KEY_NOT_CONFIGURED',

  // Resource Errors
  NOT_FOUND = 'FXQL-404',
  RESOURCE_NOT_FOUND = 'FXQL_E_RESOURCE_NOT_FOUND',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'FXQL_E_RATE_LIMIT_EXCEEDED',

  // Server Errors (500-series)
  INTERNAL_ERROR = 'FXQL-500',
  DATABASE_ERROR = 'FXQL-500-DB',
  PARSING_ERROR = 'FXQL_E_PARSING_FAILED',
  STORAGE_ERROR = 'FXQL_E_STORAGE_FAILED',
}

export interface ErrorDetail {
  field?: string;
  value?: any;
  constraint?: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  code: FxqlErrorCode | string;
  details?: ErrorDetail[];
  timestamp?: string;
  path?: string;
}

/**
 * Helper to create standardized error responses
 */
export function createErrorResponse(
  code: FxqlErrorCode,
  message: string,
  details?: ErrorDetail[],
): ErrorResponse {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
}
