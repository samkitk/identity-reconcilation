export interface ContactResponseBody {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export interface ContactRequestBody {
  email?: string;
  phoneNumber?: string;
}
