import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey, ApiKeyScope, ApiKeyStatus } from '../entities/api-key.entity';
import { createHash, randomBytes } from 'crypto';

export interface CreateApiKeyDto {
  name: string;
  scopes: ApiKeyScope[];
  description?: string;
  expiresAt?: Date;
  createdBy?: string;
}

export interface ApiKeyResult {
  id: string;
  key: string; // Plain text key (only returned on creation)
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date;
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Generate a new API key
   */
  async createApiKey(dto: CreateApiKeyDto): Promise<ApiKeyResult> {
    // Generate random API key
    const key = this.generateKey();
    const keyHash = this.hashKey(key);

    const apiKey = this.apiKeyRepository.create({
      keyHash,
      name: dto.name,
      scopes: dto.scopes,
      description: dto.description,
      expiresAt: dto.expiresAt,
      createdBy: dto.createdBy,
      status: ApiKeyStatus.ACTIVE,
    });

    const saved = await this.apiKeyRepository.save(apiKey);

    this.logger.log(`Created new API key: ${dto.name} (${saved.id})`);

    return {
      id: saved.id,
      key, // Return plain text key (only time it's accessible)
      name: saved.name,
      scopes: saved.scopes,
      expiresAt: saved.expiresAt,
    };
  }

  /**
   * Validate API key and return key details
   */
  async validateApiKey(key: string): Promise<ApiKey | null> {
    const keyHash = this.hashKey(key);

    const apiKey = await this.apiKeyRepository.findOne({
      where: { keyHash },
    });

    if (!apiKey) {
      return null;
    }

    // Check if key is active
    if (apiKey.status !== ApiKeyStatus.ACTIVE) {
      this.logger.warn(`Inactive API key used: ${apiKey.name} (${apiKey.status})`);
      return null;
    }

    // Check if key is expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      this.logger.warn(`Expired API key used: ${apiKey.name}`);
      await this.apiKeyRepository.update(
        { id: apiKey.id },
        { status: ApiKeyStatus.EXPIRED },
      );
      return null;
    }

    // Update last used timestamp
    await this.apiKeyRepository.update(
      { id: apiKey.id },
      { lastUsedAt: new Date() },
    );

    return apiKey;
  }

  /**
   * Check if API key has required scope
   */
  hasScope(apiKey: ApiKey, requiredScope: ApiKeyScope): boolean {
    return apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes(ApiKeyScope.ADMIN);
  }

  /**
   * Rotate API key (generate new key, invalidate old)
   */
  async rotateApiKey(keyId: string): Promise<ApiKeyResult> {
    const existingKey = await this.apiKeyRepository.findOne({
      where: { id: keyId },
    });

    if (!existingKey) {
      throw new Error('API key not found');
    }

    // Generate new key
    const newKey = this.generateKey();
    const newKeyHash = this.hashKey(newKey);

    // Update existing key
    await this.apiKeyRepository.update(
      { id: keyId },
      {
        keyHash: newKeyHash,
        lastRotatedAt: new Date(),
        updatedAt: new Date(),
      },
    );

    this.logger.log(`Rotated API key: ${existingKey.name} (${keyId})`);

    return {
      id: existingKey.id,
      key: newKey,
      name: existingKey.name,
      scopes: existingKey.scopes,
      expiresAt: existingKey.expiresAt,
    };
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    await this.apiKeyRepository.update(
      { id: keyId },
      { status: ApiKeyStatus.REVOKED },
    );

    this.logger.log(`Revoked API key: ${keyId}`);
  }

  /**
   * List all API keys (without plain text keys)
   */
  async listApiKeys(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      select: ['id', 'name', 'scopes', 'status', 'description', 'expiresAt', 'lastUsedAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Generate random API key
   */
  private generateKey(): string {
    const prefix = 'fxql_';
    const randomPart = randomBytes(32).toString('hex');
    return `${prefix}${randomPart}`;
  }

  /**
   * Hash API key using SHA-256
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}
