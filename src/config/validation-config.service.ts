import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ValidationRulesConfig {
  version: string;
  currencies: {
    valid_codes: string[];
  };
  business_rules: {
    max_currency_pairs_per_request: number;
    min_price: number;
    max_price: number;
    min_cap_amount: number;
    max_cap_amount: number;
  };
  rate_limits: {
    default_ttl_seconds: number;
    default_limit: number;
  };
}

@Injectable()
export class ValidationConfigService {
  constructor(private configService: ConfigService) {}

  get validCurrencies(): string[] {
    return this.configService.get<string[]>('validationRules.currencies.valid_codes', []);
  }

  get maxCurrencyPairsPerRequest(): number {
    return this.configService.get<number>(
      'validationRules.business_rules.max_currency_pairs_per_request',
      1000,
    );
  }

  get minPrice(): number {
    return this.configService.get<number>('validationRules.business_rules.min_price', 0);
  }

  get maxPrice(): number {
    return this.configService.get<number>(
      'validationRules.business_rules.max_price',
      999999999,
    );
  }

  get minCapAmount(): number {
    return this.configService.get<number>('validationRules.business_rules.min_cap_amount', 0);
  }

  get maxCapAmount(): number {
    return this.configService.get<number>(
      'validationRules.business_rules.max_cap_amount',
      2147483647,
    );
  }

  get rateLimitTTL(): number {
    return this.configService.get<number>('validationRules.rate_limits.default_ttl_seconds', 60);
  }

  get rateLimitMax(): number {
    return this.configService.get<number>('validationRules.rate_limits.default_limit', 10);
  }

  get configVersion(): string {
    return this.configService.get<string>('validationRules.version', '1.0.0');
  }

  isCurrencyValid(currency: string): boolean {
    return this.validCurrencies.includes(currency);
  }

  isPriceValid(price: number): boolean {
    return price >= this.minPrice && price <= this.maxPrice;
  }

  isCapAmountValid(cap: number): boolean {
    return cap >= this.minCapAmount && cap <= this.maxCapAmount;
  }
}
