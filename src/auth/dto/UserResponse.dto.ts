import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose() id: string;
  @Expose() full_name: string;
  @Expose() email: string;
  @Expose() phone: string;
  @Expose() gender: string;
  @Expose() role: string;
  @Expose() birth_date: string;
  @Expose() is_active: boolean;
  @Expose() created_at: Date;
  @Expose() updated_at: Date;

  @Exclude() firebase_id: string;
  @Exclude() password: string;
}
