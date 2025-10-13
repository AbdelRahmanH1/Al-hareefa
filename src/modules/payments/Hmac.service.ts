import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
@Injectable()
export class HmacService {
  private keys = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order.id',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success',
  ];
  verify(callbackData: any, receivedHmac: string, secretKey: string): boolean {
    const sortedKeys = this.keys;

    let concatenated = '';

    for (const key of sortedKeys) {
      const parts = key.split('.');

      let value: any = callbackData;

      for (const part of parts) {
        value = value?.[part];
      }

      concatenated +=
        value !== undefined && value !== null ? value.toString() : '';
    }

    const generatedHmac = crypto
      .createHmac('sha512', secretKey)
      .update(concatenated)
      .digest('hex');

    return generatedHmac == receivedHmac;
  }
}
