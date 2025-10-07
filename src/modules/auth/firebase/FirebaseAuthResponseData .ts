import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FirebaseAuthResponseData {
  @ApiProperty()
  @Expose()
  needsProfileCompletion: boolean;

  @ApiProperty()
  @Expose()
  token?: string;

  @ApiProperty()
  @Expose()
  userId?: bigint;
}
