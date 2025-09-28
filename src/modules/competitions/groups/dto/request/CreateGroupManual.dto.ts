import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateGroupManualDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of participant IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  participantIds: number[];
}
