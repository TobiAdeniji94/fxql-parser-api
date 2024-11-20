import { IsString, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFxqlDto {
    @ApiProperty({
        description: 'FXQL statements containing currency pairs, buy/sell prices, and caps. Supports multi-line input.',
        example: 'USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}\n\nEUR-JPY {\n  BUY 145.20\n  SELL 146.50\n  CAP 50000\n}\n\nNGN-USD {\n  BUY 0.0022\n  SELL 0.0023\n  CAP 2000000\n}',
    })
    @IsString()
    @IsNotEmpty({ message: 'FXQL statement cannot be empty.' })
    @Matches(
        /^(?:[A-Z]{3}-[A-Z]{3} \{\s*BUY (\d+(\.\d+)?|0)\s*SELL (\d+(\.\d+)?|0)\s*CAP (\d+)\s*\})+$/,
        {
            message: 'FXQL statement is not in the correct format.',
        },
    )
    FXQL: string;
}
