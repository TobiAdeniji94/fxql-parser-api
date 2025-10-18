import { HttpException, HttpStatus } from '@nestjs/common';
import { FxqlErrorCode, ErrorDetail, createErrorResponse } from '../constants/error-codes';

export class CustomBadRequestException extends HttpException {
  constructor(message: string, code: FxqlErrorCode = FxqlErrorCode.BAD_REQUEST, details?: ErrorDetail[]) {
    super(createErrorResponse(code, message, details), HttpStatus.BAD_REQUEST);
  }
}

export class CustomUnauthorizedException extends HttpException {
  constructor(message: string, code: FxqlErrorCode = FxqlErrorCode.UNAUTHORIZED, details?: ErrorDetail[]) {
    super(createErrorResponse(code, message, details), HttpStatus.UNAUTHORIZED);
  }
}

export class CustomForbiddenException extends HttpException {
  constructor(message: string, code: FxqlErrorCode = FxqlErrorCode.FORBIDDEN, details?: ErrorDetail[]) {
    super(createErrorResponse(code, message, details), HttpStatus.FORBIDDEN);
  }
}

export class CustomNotFoundException extends HttpException {
  constructor(message: string, code: FxqlErrorCode = FxqlErrorCode.NOT_FOUND, details?: ErrorDetail[]) {
    super(createErrorResponse(code, message, details), HttpStatus.NOT_FOUND);
  }
}

export class CustomInternalServerErrorException extends HttpException {
  constructor(message: string, code: FxqlErrorCode = FxqlErrorCode.INTERNAL_ERROR, details?: ErrorDetail[]) {
    super(createErrorResponse(code, message, details), HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
