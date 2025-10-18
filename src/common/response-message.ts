import { FxqlErrorCode, ErrorDetail } from './constants/error-codes';

export interface ResponseMessage {
    message: string;
    code: string | FxqlErrorCode;
    data?: object;
    details?: ErrorDetail[];
    timestamp?: string;
}

export const responseMessage = (
    message?: string, 
    code?: string | FxqlErrorCode, 
    data?: object,
    details?: ErrorDetail[]
): ResponseMessage => {
    return {
        message,
        code,
        data,
        details,
        timestamp: new Date().toISOString(),
    }
}