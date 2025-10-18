import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  const configPath = join(process.cwd(), 'config', 'validation-rules.yaml');
  
  try {
    const validationRules = yaml.load(
      readFileSync(configPath, 'utf8'),
    ) as Record<string, any>;

    return {
      validationRules,
    };
  } catch (error) {
    console.error('Failed to load validation rules configuration:', error);
    // Return default fallback configuration
    return {
      validationRules: {
        version: '1.0.0',
        currencies: {
          valid_codes: ['USD', 'EUR', 'GBP', 'JPY', 'NGN'],
        },
        business_rules: {
          max_currency_pairs_per_request: 1000,
          min_price: 0,
          max_price: 999999999,
          min_cap_amount: 0,
          max_cap_amount: 2147483647,
        },
        rate_limits: {
          default_ttl_seconds: 60,
          default_limit: 10,
        },
      },
    };
  }
};
