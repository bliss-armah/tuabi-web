export const toWhatsAppNumber = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  if (digits.length === 9) return `233${digits}`;
  return digits;
};

export const whatsAppLink = (phoneNumber: string, message: string) =>
  `https://wa.me/${toWhatsAppNumber(phoneNumber)}?text=${encodeURIComponent(message)}`;
