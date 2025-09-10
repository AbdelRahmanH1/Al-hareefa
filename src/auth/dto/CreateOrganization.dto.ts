import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationProfileDto {
  @IsString()
  @MinLength(3, { message: 'Organizer name must be at least 3 character long' })
  @MaxLength(30, { message: 'Organizer name must be exceed 30 character' })
  ownerName: string;
}
