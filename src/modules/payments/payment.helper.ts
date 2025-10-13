import { splitFullName } from 'src/shared/helpers/SplitName.util';
import { PaymentDataInput } from './Interface/PaymentDataInput';
import { AxiosInstance } from 'axios';
import { PAYMOB_CONFIG } from './payyment.constants';

export const buildPaymentData = (input: PaymentDataInput) => {
  const amountInCents = input.amount * 100;
  const { firstName, lastName } = splitFullName(input.fullname);
  return {
    amount: amountInCents,
    currency: input.currency,
    payment_methods: [
      PAYMOB_CONFIG.PAYMENT_METHODS.CARD,
      PAYMOB_CONFIG.PAYMENT_METHODS.WALLET,
      PAYMOB_CONFIG.PAYMENT_METHODS.KIOSK,
    ],
    items: [
      {
        name: input.serviceName,
        amount: amountInCents,
        description: `Payment for ${input.description || 'no description'}`,
        quantity: 1,
      },
    ],
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: input.email,
      phone_number: input.phoneNumber,
    },
    billing_data: {
      apartment: '',
      first_name: firstName,
      last_name: lastName,
      street: '',
      building: '',
      phone_number: input.phoneNumber,
      country: 'EGY',
      email: input.email,
      floor: '',
      state: '',
    },
    special_reference: input.payment_id.toString(),
    expiration: 18000,
    notification_url: PAYMOB_CONFIG.NOTIFICATION_URL,
    // redirection_url: PAYMOB_CONFIG.REDIRECTION_URL,
  };
};

export const createPaymentIntention = async (
  axiosInstance: any,
  paymentData: any,
) => {
  const url = `${PAYMOB_CONFIG.BASE_URL}/v1/intention`;
  const headers = {
    Authorization: `Token ${PAYMOB_CONFIG.SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axiosInstance.post(url, paymentData, { headers });
    return response.data;
  } catch (error: any) {
    const respData = error.response?.data;
    const statusCode = error.response?.status;

    if (statusCode === 403) {
      throw new Error('Authentication failed with Paymob. Check your API key.');
    }

    if (statusCode === 406 || respData?.error_code === '406') {
      throw new Error('Invalid input provided to Paymob.');
    }

    if (respData?.error_code === '1705') {
      throw new Error(
        'A transaction with the same details is already in progress.',
      );
    }

    if (statusCode === 404) {
      throw new Error('Endpoint not found on Paymob.');
    }

    throw new Error(
      `Failed to create payment intention: ${respData?.message || error.message || 'Unknown error'}`,
    );
  }
};

export const formatPaymentResponse = (
  data: any,
  amount: number,
  currency: string,
) => {
  const checkoutLink = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_CONFIG.PUBLIC_KEY}&clientSecret=${data.client_secret}`;

  return {
    data: {
      intention_id: data.id,
      client_secret: data.client_secret,
      checkout_link: checkoutLink,
      amount,
      currency,
    },
  };
};

export const processPayment = async (
  axios: AxiosInstance,
  paymentInput: PaymentDataInput,
) => {
  const paymentData = buildPaymentData(paymentInput);
  const intentionData = await createPaymentIntention(axios, paymentData);
  return formatPaymentResponse(
    intentionData,
    paymentInput.amount,
    paymentInput.currency,
  );
};
