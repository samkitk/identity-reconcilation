export async function validateEmail(email: string) {
  const emailRegex = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
  );
  return emailRegex.test(email);
}

export async function validatePhoneNumberDigits(phoneNumber: string) {
  const phoneNumberRegex = new RegExp("^[0-9]+$");
  return phoneNumberRegex.test(phoneNumber);
}
