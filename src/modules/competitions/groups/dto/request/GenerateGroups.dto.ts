import { IsInt, Min } from 'class-validator';

export class GenerateGroupsDto {
  @IsInt()
  @Min(1)
  numberOfGroups: number;

  @IsInt()
  @Min(1)
  participantsPerGroup: number;
}
