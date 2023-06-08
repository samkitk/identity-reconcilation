import { Contact, LinkPrecedence } from "@prisma/client";
import { prisma } from "../helpers/prisma";
import { ContactResponseBody } from "../helpers/interfaces";
import { logger } from "../helpers/winston";
import {
  createNewContact,
  getSimilarContacts,
  primarySimilarContactCountCheck,
  getPrimaryContactFromEmailAndPhoneNumber,
  getSecondaryContacts,
  getEmails,
  getPhoneNumbers,
  getSecondaryContactsIds,
  getContactResponseBody,
} from "./contact";

export async function identificationService(
  email?: string,
  phoneNumber?: string
): Promise<ContactResponseBody | null> {
  // create new contact for incoming email and phone number
  let newContact = await createNewContact(email, phoneNumber);

  // Check if there are any similar contacts
  let similarContacts = await getSimilarContacts(email, phoneNumber);

  logger.info("Similar Contacts Length", {
    similarContactsLength: similarContacts?.length,
  });

  if (!similarContacts) {
    return null;
  }
  // If only 1 similar contact, that means the contact was just created.
  if (similarContacts.length == 1) {
    if (newContact) {
      let emails: string[] = [];
      let phoneNumbers: string[] = [];

      if (newContact.email) {
        emails.push(newContact.email);
      }
      if (newContact.phoneNumber) {
        phoneNumbers.push(newContact.phoneNumber);
      }

      let contactResponseBody: ContactResponseBody = {
        primaryContactId: newContact.id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: [],
      };
      logger.info("New Contact Response Body", {
        contactResponseBody: contactResponseBody,
      });
      return contactResponseBody;
    }
  }

  // Check if other primary contacts have same email or phone number and if so, change primary contact to the oldest one
  // and also shift the old secondary contacts to new one
  await primarySimilarContactCountCheck(similarContacts);
  let primaryContact: Contact | null = null;
  let secondaryContacts: Contact[] | null;

  primaryContact = await getPrimaryContactFromEmailAndPhoneNumber(
    email,
    phoneNumber
  );

  logger.info("Primary Contact E P", { primaryContact: primaryContact });

  if (primaryContact) {
    secondaryContacts = await getSecondaryContacts(primaryContact.id);

    logger.info("Secondary Contacts", { secondaryContacts: secondaryContacts });

    if (secondaryContacts.length > 0) {
      let emails = await getEmails(primaryContact, secondaryContacts);
      let phoneNumbers = await getPhoneNumbers(
        primaryContact,
        secondaryContacts
      );
      let secondaryContactIds = await getSecondaryContactsIds(
        secondaryContacts
      );
      let contactResponseBody: ContactResponseBody = {
        primaryContactId: primaryContact.id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryContactIds,
      };
      return contactResponseBody;
    }

    let contactResponseBody: ContactResponseBody = await getContactResponseBody(
      primaryContact.id
    );
    return contactResponseBody;
  } else {
    logger.error("Primary Contact Not Found", {
      email: email,
      phoneNumber: phoneNumber,
    });
    return null;
  }
}
