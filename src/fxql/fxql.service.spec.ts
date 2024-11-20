import { Test, TestingModule } from '@nestjs/testing';
import { FxqlService } from './fxql.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { Repository } from 'typeorm';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('FxqlService', () => {
  let service: FxqlService;
  let repository: Repository<FxqlEntry>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlService,
        {
          provide: getRepositoryToken(FxqlEntry),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FxqlService>(FxqlService);
    repository = module.get<Repository<FxqlEntry>>(getRepositoryToken(FxqlEntry));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseFxql', () => {
    it('should parse valid FXQL statements', () => {
      const fxql = 'USD-EUR { BUY 1.2 SELL 1.1 CAP 100 }';
      const result = service['parseFxql'](fxql);

      expect(result).toEqual({
        message: 'FXQL statements parsed successfully.',
        code: 'FXQL-200',
        data: [
          {
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
            buyPrice: 1.2,
            sellPrice: 1.1,
            capAmount: 100,
          },
        ],
      });
    });

    it('should return an error for invalid FXQL statement', () => {
      const fxql = 'INVALID { BUY 1.0 SELL 0.9 CAP 50 }';
      const result = service['parseFxql'](fxql);

      expect(result).toEqual({
        message: 'Invalid FXQL statement: "INVALID { BUY 1.0 SELL 0.9 CAP 50 }" at line 1, character 1',
        code: 'FXQL-400',
      });
    });
  });

  describe('processFxqlStatements', () => {
    it('should return parsed statements if valid', async () => {
      const fxqlDto = {
        FXQL: 'USD-EUR { BUY 1.2 SELL 1.1 CAP 100 }',
      };

      const saveSpy = jest.spyOn(mockRepository, 'save').mockResolvedValue([
        {
          id: 1,
          sourceCurrency: 'USD',
          destinationCurrency: 'EUR',
          buyPrice: 1.2,
          sellPrice: 1.1,
          capAmount: 100,
        },
      ]);

      const result = await service.processFxqlStatements(fxqlDto);

      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Rates Parsed Successfully.',
        code: 'FXQL-200',
        data: [
          {
            id: 1,
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
            buyPrice: 1.2,
            sellPrice: 1.1,
            capAmount: 100,
          },
        ],
      });
    });

    it('should return an error if FXQL is invalid', async () => {
      const fxqlDto = {
        FXQL: 'INVALID { BUY 1.0 SELL 0.9 CAP 50 }',
      };

      const result = await service.processFxqlStatements(fxqlDto);

      expect(result).toEqual({
        message: 'Invalid FXQL statement: "INVALID { BUY 1.0 SELL 0.9 CAP 50 }" at line 1, character 1',
        code: 'FXQL-400',
      });
    });
  });
});
