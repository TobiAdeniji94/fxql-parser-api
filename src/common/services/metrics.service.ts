import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  public readonly registry: Registry;

  // Counters
  private readonly fxqlRequestsTotal: Counter;
  private readonly fxqlRequestsSuccess: Counter;
  private readonly fxqlRequestsFailure: Counter;
  private readonly fxqlEntriesParsed: Counter;
  private readonly rateLimitExceeded: Counter;
  private readonly idempotencyHits: Counter;

  // Histograms
  private readonly requestDuration: Histogram;
  private readonly databaseQueryDuration: Histogram;

  // Gauges
  private readonly activeConnections: Gauge;

  constructor() {
    this.registry = new Registry();

    // Request counters
    this.fxqlRequestsTotal = new Counter({
      name: 'fxql_requests_total',
      help: 'Total number of FXQL requests',
      labelNames: ['method', 'endpoint', 'status_code', 'api_key'],
      registers: [this.registry],
    });

    this.fxqlRequestsSuccess = new Counter({
      name: 'fxql_requests_success_total',
      help: 'Total number of successful FXQL requests',
      labelNames: ['api_key'],
      registers: [this.registry],
    });

    this.fxqlRequestsFailure = new Counter({
      name: 'fxql_requests_failure_total',
      help: 'Total number of failed FXQL requests',
      labelNames: ['api_key', 'error_code'],
      registers: [this.registry],
    });

    this.fxqlEntriesParsed = new Counter({
      name: 'fxql_entries_parsed_total',
      help: 'Total number of FXQL entries parsed',
      labelNames: ['source_currency', 'dest_currency'],
      registers: [this.registry],
    });

    this.rateLimitExceeded = new Counter({
      name: 'fxql_rate_limit_exceeded_total',
      help: 'Total number of rate limit exceeded events',
      labelNames: ['api_key'],
      registers: [this.registry],
    });

    this.idempotencyHits = new Counter({
      name: 'fxql_idempotency_hits_total',
      help: 'Total number of idempotency key cache hits',
      labelNames: ['api_key'],
      registers: [this.registry],
    });

    // Request duration histogram
    this.requestDuration = new Histogram({
      name: 'fxql_request_duration_seconds',
      help: 'Duration of FXQL requests in seconds',
      labelNames: ['method', 'endpoint', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'fxql_database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
      registers: [this.registry],
    });

    // Active connections gauge
    this.activeConnections = new Gauge({
      name: 'fxql_active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });
  }

  async onModuleInit() {
    // Register default metrics (CPU, memory, etc.)
    const collectDefaultMetrics = require('prom-client').collectDefaultMetrics;
    collectDefaultMetrics({ register: this.registry });
  }

  /**
   * Increment total requests
   */
  incrementRequestsTotal(method: string, endpoint: string, statusCode: number, apiKey: string) {
    const maskedKey = this.maskApiKey(apiKey);
    this.fxqlRequestsTotal.inc({ method, endpoint, status_code: statusCode, api_key: maskedKey });
  }

  /**
   * Increment successful requests
   */
  incrementRequestsSuccess(apiKey: string) {
    this.fxqlRequestsSuccess.inc({ api_key: this.maskApiKey(apiKey) });
  }

  /**
   * Increment failed requests
   */
  incrementRequestsFailure(apiKey: string, errorCode: string) {
    this.fxqlRequestsFailure.inc({ api_key: this.maskApiKey(apiKey), error_code: errorCode });
  }

  /**
   * Increment parsed entries
   */
  incrementEntriesParsed(sourceCurrency: string, destCurrency: string, count: number = 1) {
    this.fxqlEntriesParsed.inc({ source_currency: sourceCurrency, dest_currency: destCurrency }, count);
  }

  /**
   * Increment rate limit exceeded
   */
  incrementRateLimitExceeded(apiKey: string) {
    this.rateLimitExceeded.inc({ api_key: this.maskApiKey(apiKey) });
  }

  /**
   * Increment idempotency cache hits
   */
  incrementIdempotencyHits(apiKey: string) {
    this.idempotencyHits.inc({ api_key: this.maskApiKey(apiKey) });
  }

  /**
   * Observe request duration
   */
  observeRequestDuration(method: string, endpoint: string, statusCode: number, durationSeconds: number) {
    this.requestDuration.observe({ method, endpoint, status_code: statusCode }, durationSeconds);
  }

  /**
   * Observe database query duration
   */
  observeDatabaseQueryDuration(operation: string, durationSeconds: number) {
    this.databaseQueryDuration.observe({ operation }, durationSeconds);
  }

  /**
   * Set active connections
   */
  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Mask API key for privacy
   */
  private maskApiKey(key: string): string {
    if (!key || key.length < 8) return 'unknown';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }
}
