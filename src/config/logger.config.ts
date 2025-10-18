import { Params } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,
    
    // Generate unique request ID
    genReqId: (req, res) => {
      const existingId = req.id ?? req.headers['x-request-id'];
      if (existingId) return existingId;
      const id = uuidv4();
      res.setHeader('X-Request-Id', id);
      return id;
    },

    // Custom serializers
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          apiKey: req.headers['x-api-key'] ? maskApiKey(req.headers['x-api-key']) : undefined,
          userAgent: req.headers['user-agent'],
          remoteAddress: req.ip,
          idempotencyKey: req.headers['idempotency-key'],
        };
      },
      res(res) {
        const requestId = typeof res.getHeader === 'function'
          ? res.getHeader('x-request-id')
          : res.headers?.['x-request-id'] ?? res.request?.id ?? res.req?.id;

        return {
          statusCode: res.statusCode,
          requestId,
        };
      },
    },

    // Custom log level
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      if (res.statusCode >= 300) return 'info';
      return 'info';
    },

    // Don't log successful health checks to reduce noise
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  },
};

/**
 * Mask API key for security (show first/last 4 chars)
 */
function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
