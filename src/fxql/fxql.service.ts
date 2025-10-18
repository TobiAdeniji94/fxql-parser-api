import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { CreateFxqlDto } from './dto/create-fxql.dto';
import { ResponseMessage, responseMessage } from '../common/response-message';
import { ValidationConfigService } from '../config/validation-config.service';
import { FxqlErrorCode } from '../common/constants/error-codes';

@Injectable()
export class FxqlService {
    private readonly logger = new Logger(FxqlService.name);

    constructor(
        @InjectRepository(FxqlEntry)
        private readonly fxqlRepository: Repository<FxqlEntry>,
        private readonly validationConfig: ValidationConfigService,
    ) {}

    // method to handle the parsing and saving of FXQL statements
    async processFxqlStatements(createFxqlDto: CreateFxqlDto): Promise<ResponseMessage> {
        try {
            this.logger.log('Processing FXQL statements'); // log start of process

            const decodedFxql = createFxqlDto.FXQL.replace(/\\n/g, '\n').trim();

            const fxqlResponse = this.parseFxql(decodedFxql);

            // Log if parsing fails
            if (fxqlResponse.code !== FxqlErrorCode.SUCCESS) {
                this.logger.warn(`Parsing failed: ${fxqlResponse.message}`);
                return fxqlResponse;
            }

            const fxqlStatements = fxqlResponse.data as any[];

            if (!fxqlStatements || fxqlStatements.length === 0) {
                this.logger.warn('No valid FXQL statements found.');
                return responseMessage('No valid FXQL statements found.', FxqlErrorCode.EMPTY_STATEMENT); 
            }

            // check if the number of currency pairs exceeds the limit
            const maxPairs = this.validationConfig.maxCurrencyPairsPerRequest;
            if (fxqlStatements.length > maxPairs) {
                this.logger.warn(`Exceeded max currency pairs limit. Count: ${fxqlStatements.length}`);
                return responseMessage(
                    `Exceeded maximum currency pairs limit. A maximum of ${maxPairs} currency pairs are allowed per request.`,
                    FxqlErrorCode.EXCEEDS_MAX_PAIRS,
                    null,
                    [{ field: 'count', value: fxqlStatements.length, constraint: `max ${maxPairs}`, message: 'Too many currency pairs' }]
                );
            }

            // save entry to the database
            try {
                this.logger.log('Saving FXQL entries to the database');
                const savedEntries = await this.fxqlRepository.save(fxqlStatements);
                this.logger.log(`Successfully saved ${savedEntries.length} FXQL entries.`);
                return responseMessage(
                    'Rates Parsed Successfully.',
                    FxqlErrorCode.SUCCESS, 
                    savedEntries
                );
            } catch (error) {
                this.logger.error('Error saving FXQL entries to the database', error.stack);
                return responseMessage(
                    'An error occurred while saving FXQL entries to the database.',
                    FxqlErrorCode.DATABASE_ERROR,
                );
            }
        } catch (error) {
            this.logger.error('Error processing FXQL statements', error.stack);
            return responseMessage(
                'An unexpected error occurred while processing FXQL statements.',
                FxqlErrorCode.INTERNAL_ERROR,
            );
        }
    }

    // method to parse the FXQL string and extract the relevant data
    private parseFxql(fxql: string): ResponseMessage {
        try {
            this.logger.log('Parsing FXQL statements');

            const statements: any[] = [];
            const fxqlRegex =
                /([A-Z]{3})-([A-Z]{3})\s*\{\s*BUY\s*(\d+(\.\d+)?)(?:\s|\n)*SELL\s*(\d+(\.\d+)?)(?:\s|\n)*CAP\s*(\d+)\s*\}/g;
            let match;

            while ((match = fxqlRegex.exec(fxql)) !== null) {
                const [fullMatch, sourceCurrency, destinationCurrency, buyPrice, , sellPrice, , capAmount] = match;
                
                if (this.isValidFxqlEntry(sourceCurrency, destinationCurrency, buyPrice, sellPrice, capAmount)) {
                    statements.push({
                        sourceCurrency,
                        destinationCurrency,
                        buyPrice: parseFloat(buyPrice),
                        sellPrice: parseFloat(sellPrice),
                        capAmount: parseInt(capAmount, 10),
                    });
                } else {
                    this.logger.warn(`Invalid FXQL statement: ${fullMatch}`);
                    return responseMessage(`Invalid FXQL statement: ${fullMatch}`, FxqlErrorCode.INVALID_FORMAT);
                }
            }
            
            if (statements.length === 0) {
                this.logger.warn('No valid FXQL statements found during parsing.');
                return responseMessage(
                    "No valid FXQL statements found.", 
                    FxqlErrorCode.MALFORMED_SYNTAX
                );
            }

            this.logger.log(`Parsed ${statements.length} FXQL statements successfully.`);
            return responseMessage(
                "FXQL statements parsed successfully.", 
                FxqlErrorCode.SUCCESS, 
                statements
            );
        } catch (error) {
            this.logger.error('Error parsing FXQL statements', error.stack);
            return responseMessage(
                'An error occurred while parsing FXQL statements.',
                FxqlErrorCode.PARSING_ERROR,
            );
        }
    }
    // function to validate an individual FXQL entry
    private isValidFxqlEntry(
        sourceCurrency: string,
        destinationCurrency: string,
        buyPrice: string,
        sellPrice: string,
        capAmount: string,
    ): boolean {
            const buy = parseFloat(buyPrice);
            const sell = parseFloat(sellPrice);
            const cap = parseInt(capAmount, 10);

            const isValid =
                this.validationConfig.isCurrencyValid(sourceCurrency) &&
                this.validationConfig.isCurrencyValid(destinationCurrency) &&
                !isNaN(buy) &&
                !isNaN(sell) &&
                !isNaN(cap) &&
                this.validationConfig.isPriceValid(buy) &&
                this.validationConfig.isPriceValid(sell) &&
                this.validationConfig.isCapAmountValid(cap);

            if (!isValid) {
                this.logger.debug(`Invalid entry: ${sourceCurrency}-${destinationCurrency}, BUY: ${buyPrice}, SELL: ${sellPrice}, CAP: ${capAmount}`);
            }
            
            return isValid;
    }
}
