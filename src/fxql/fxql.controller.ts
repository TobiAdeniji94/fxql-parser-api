import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { CreateFxqlDto } from './dto/create-fxql.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('fxql')
@ApiSecurity('x-api-key')
@Controller('fxql-statements')
export class FxqlController {
  constructor(private readonly fxqlService: FxqlService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Process FXQL statements' }) 
  @ApiResponse({
    status: 200,
    description: 'Successfully processed FXQL statements.',
    schema: {
      example: {
        message : "Rates Parsed Successfully.",
        code: "FXQL-200",
        data: [
          {
            sourceCurrency: "USD",
            destinationCurrency: "GBP",
            buyPrice: 0.85,
            sellPrice: 0.9,
            capAmount: 10000,
            EntryId: "91814778-0de1-4bb6-9859-0c685dd47cef",
            createdAt: "2024-11-21T08:25:25.020Z"
          }
        ]
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or FXQL statements.',
    schema: {
      example: {
        message: 'No valid FXQL statements found',
        code: 'FXQL-400',
      },
    },
  })
  @ApiBody({
    description: 'FXQL statements to be processed',
    type: CreateFxqlDto,
    examples: {
      singleStatement: {
        summary: 'Single FXQL Statement',
        value: {
          FXQL: 'USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}',
        },
      },
      multipleStatements: {
        summary: 'Multiple FXQL Statements',
        value: {
          FXQL: 'USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}\n\nEUR-JPY {\n  BUY 145.20\n  SELL 146.50\n  CAP 50000\n}',
        },
      },
    },
  })
  async create(@Body() createFxqlDto: CreateFxqlDto) {
    return await this.fxqlService.processFxqlStatements(createFxqlDto);
  }
}
