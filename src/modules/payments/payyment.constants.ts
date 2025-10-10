export const PAYMOB_CONFIG = {
  BASE_URL: process.env.PAYMOB_BASEURL || 'https://accept.paymob.com',
  SECRET_KEY: process.env.PAYMOB_SECRETKEY || '',
  PUBLIC_KEY: process.env.PAYMOB_PUBLICKEY || '',
  NOTIFICATION_URL: process.env.PAYMOB_WEBHOOK_URL || '',
  REDIRECTION_URL: process.env.PAYMOB_REDIRECT_URL || '',
  PAYMENT_METHODS: {
    CARD: Number(process.env.PAYMOB_CARD_ID || 0),
    WALLET: Number(process.env.PAYMOB_WALLET_ID || 0),
    KIOSK: Number(process.env.PAYMOB_KIOSK_ID || 0),
  },
};
