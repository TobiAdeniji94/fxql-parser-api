export interface ResponseMessage {
    message: string;
    code: string
    data: object;
}

export const responseMessage = (message?: string, code?: string, data?: object) => {
    return {
        message,
        code,
        data
    }
}