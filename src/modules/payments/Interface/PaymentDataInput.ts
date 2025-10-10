export interface PaymentDataInput {
  amount: number;
  currency: string;
  serviceName: string;
  description: string;
  phoneNumber: string;
  fullname: string;
  email: string;
  payment_id: number | bigint;
}
