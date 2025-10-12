export function generateWhatsAppLink(
  phoneNumber: string,
  message: string,
): string {
  let cleanNumber = phoneNumber.trim();

  if (cleanNumber.startsWith('0')) {
    cleanNumber = '20' + cleanNumber.slice(1);
  }

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
