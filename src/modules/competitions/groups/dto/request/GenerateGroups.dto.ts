import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class GenerateGroupsDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  numberOfGroups: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  participantsPerGroup: number;
}
