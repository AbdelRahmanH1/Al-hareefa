export class ResponseDto<T> {
  success: boolean;
  message: string;
  data: T;
}
