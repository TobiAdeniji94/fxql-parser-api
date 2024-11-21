import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomBadRequestException extends HttpException {
  constructor(message: string) {
    super({ message, code: 'FXQL-400' }, HttpStatus.BAD_REQUEST);
  }
}

export class CustomUnauthorizedException extends HttpException {
  constructor(message: string) {
    super({ message, code: 'FXQL-401' }, HttpStatus.UNAUTHORIZED);
  }
}

export class CustomForbiddenException extends HttpException {
  constructor(message: string) {
    super({ message, code: 'FXQL-403' }, HttpStatus.FORBIDDEN);
  }
}

export class CustomNotFoundException extends HttpException {
  constructor(message: string) {
    super({ message, code: 'FXQL-404' }, HttpStatus.NOT_FOUND);
  }
}

export class CustomInternalServerErrorException extends HttpException {
  constructor(message: string) {
    super({ message, code: 'FXQL-500' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
