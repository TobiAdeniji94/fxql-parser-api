import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { CreateFxqlDto } from './dto/create-fxql.dto';
import { ResponseMessage, responseMessage } from '../common/response-message';

@Injectable()
export class FxqlService {
    private readonly logger = new Logger(FxqlService.name); // Add Logger instance

    constructor(
        @InjectRepository(FxqlEntry)
        private readonly fxqlRepository: Repository<FxqlEntry>,
    ) {}

    // max number of currency pairs per request
    private readonly MAX_CURRENCY_PAIRS = 1000;

    // method to handle the parsing and saving of FXQL statements
    async processFxqlStatements(createFxqlDto: CreateFxqlDto): Promise<ResponseMessage> {
        this.logger.log('Processing FXQL statements'); // Log start of the process

        const fxqlResponse = this.parseFxql(createFxqlDto.FXQL);

        // Log if parsing fails
        if (fxqlResponse.code === "FXQL-400") {
            this.logger.warn(`Parsing failed: ${fxqlResponse.message}`);
            return fxqlResponse;
        }

        const fxqlStatements = fxqlResponse.data as any[];
        if (!fxqlStatements || fxqlStatements.length === 0) {
            this.logger.warn('No valid FXQL statements found.');
            return responseMessage("No valid FXQL statements found.", "FXQL-400");
        }

        // Check if the number of currency pairs exceeds the limit
        if (fxqlStatements.length > this.MAX_CURRENCY_PAIRS) {
            this.logger.warn(`Exceeded max currency pairs limit. Count: ${fxqlStatements.length}`);
            return responseMessage(
                `Exceeded maximum currency pairs limit. A maximum of ${this.MAX_CURRENCY_PAIRS} currency pairs are allowed per request.`,
                "FXQL-400",
            );
        }

        // Save entry to the database
        try {
            const savedEntries = await this.saveFxqlEntries(fxqlStatements);
            this.logger.log(`Successfully saved ${savedEntries.length} FXQL entries.`);
            return responseMessage('Rates Parsed Successfully.', 'FXQL-200', savedEntries);
        } catch (error) {
            this.logger.error('Error saving FXQL entries to the database', error.stack);
            throw error;
        }
    }

    // method to parse the FXQL string and extract the relevant data
    private parseFxql(fxql: string): ResponseMessage {
        this.logger.log('Parsing FXQL statements'); // Log parsing start

        const statements: any[] = [];
        const fxqlRegex = /([A-Z]{3})-([A-Z]{3})\s*\{\s*BUY\s*(\d+(\.\d+)?)\s*SELL\s*(\d+(\.\d+)?)\s*CAP\s*(\d+)\s*\}/g;
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
                return responseMessage(`Invalid FXQL statement: ${fullMatch}`, "FXQL-400");
            }
        }

        if (statements.length === 0) {
            this.logger.warn('No valid FXQL statements found during parsing.');
            return responseMessage("No valid FXQL statements found.", "FXQL-400");
        }

        this.logger.log(`Parsed ${statements.length} FXQL statements successfully.`);
        return responseMessage("FXQL statements parsed successfully.", "FXQL-200", statements);
    }

    // function to validate an individual FXQL entry
    private isValidFxqlEntry(
        sourceCurrency: string,
        destinationCurrency: string,
        buyPrice: string,
        sellPrice: string,
        capAmount: string,
    ): boolean {
        const validCurrencies = ['USD', 'GBP', 'EUR'];
        const isValid = validCurrencies.includes(sourceCurrency) &&
                        validCurrencies.includes(destinationCurrency) &&
                        !isNaN(parseFloat(buyPrice)) &&
                        !isNaN(parseFloat(sellPrice)) &&
                        !isNaN(parseInt(capAmount, 10)) &&
                        parseInt(capAmount, 10) >= 0;

        if (!isValid) {
            this.logger.debug(`Invalid entry: ${sourceCurrency}-${destinationCurrency}, BUY: ${buyPrice}, SELL: ${sellPrice}, CAP: ${capAmount}`);
        }
        return isValid;
    }

    // Method to save parsed FXQL entries to the database
    private async saveFxqlEntries(entries: any[]): Promise<any[]> {
        try {
            this.logger.log('Saving FXQL entries to the database');
            return await this.fxqlRepository.save(entries);
        } catch (error) {
            this.logger.error('Database error', error.stack);
            
        }
    }
}
