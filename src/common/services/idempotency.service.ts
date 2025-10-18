import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IdempotencyRecord } from '../entities/idempotency-record.entity';
import { createHash } from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface CachedResponse {
  response: any;
  statusCode: number;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly TTL_HOURS = 24; // Idempotency key valid for 24 hours

  constructor(
    @InjectRepository(IdempotencyRecord)
    private readonly idempotencyRepository: Repository<IdempotencyRecord>,
  ) {}

  /**
   * Generate hash of request body for duplicate detection
   */
  private generateRequestHash(body: any): string {
    const bodyString = JSON.stringify(body);
    return createHash('sha256').update(bodyString).digest('hex');
  }

  /**
   * Check if idempotency key exists and return cached response
   */
  async getCachedResponse(
    idempotencyKey: string,
    apiKey: string,
  ): Promise<CachedResponse | null> {
    try {
      const record = await this.idempotencyRepository.findOne({
        where: {
          idempotencyKey,
          apiKey,
        },
      });

      if (!record) {
        return null;
      }

      // Check if expired
      if (new Date() > record.expiresAt) {
        this.logger.debug(`Idempotency key expired: ${idempotencyKey}`);
        await this.idempotencyRepository.delete({ idempotencyKey });
        return null;
      }

      this.logger.log(`Returning cached response for idempotency key: ${idempotencyKey}`);
      return {
        response: record.response,
        statusCode: record.statusCode,
      };
    } catch (error) {
      this.logger.error('Error retrieving cached response:', error);
      return null;
    }
  }

  /**
   * Store response for future idempotent requests
   */
  async cacheResponse(
    idempotencyKey: string,
    apiKey: string,
    requestBody: any,
    response: any,
    statusCode: number,
  ): Promise<void> {
    try {
      const requestHash = this.generateRequestHash(requestBody);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.TTL_HOURS);

      const record = this.idempotencyRepository.create({
        idempotencyKey,
        apiKey,
        requestHash,
        response,
        statusCode,
        expiresAt,
      });

      await this.idempotencyRepository.save(record);
      this.logger.log(`Cached response for idempotency key: ${idempotencyKey}`);
    } catch (error) {
      // If duplicate key error, it's okay - another request beat us to it
      if (error.code === '23505') {
        this.logger.debug('Idempotency key already cached (race condition handled)');
      } else {
        this.logger.error('Error caching response:', error);
      }
    }
  }

  /**
   * Cleanup expired idempotency records
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredRecords(): Promise<void> {
    try {
      const result = await this.idempotencyRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      if (result.affected > 0) {
        this.logger.log(`Cleaned up ${result.affected} expired idempotency records`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired records:', error);
    }
  }
}
