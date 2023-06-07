import { Contact, LinkPrecedence } from "@prisma/client";
import { prisma } from "../helpers/prisma";
import { ContactResponseBody } from "../helpers/interfaces";
import { logger } from "../helpers/winston";

export async function createNewContact(email?: string, phoneNumber?: string) {
  let newContact: Contact | null = null;

  const data: {
    email?: string;
    phoneNumber?: string;
    linkPrecedence: LinkPrecedence;
  } = {
    linkPrecedence: LinkPrecedence.PRIMARY,
  };

  if (email) {
    data.email = email;
  }

  if (phoneNumber) {
    data.phoneNumber = phoneNumber;
  }

  newContact = await prisma.contact.create({ data });

  if (newContact) {
    logger.info("New Contact", { newContact });
    return newContact;
  } else {
    return null;
  }
}

export async function getPrimaryContactFromEmail(
  email: string
): Promise<Contact | null> {
  let contact = await prisma.contact.findFirst({
    where: {
      email: email,
      linkPrecedence: LinkPrecedence.PRIMARY,
    },
  });

  return contact;
}

export async function getPrimaryContactFromPhoneNumber(
  phoneNumber: string
): Promise<Contact | null> {
  let contact = await prisma.contact.findFirst({
    where: {
      phoneNumber: phoneNumber,
      linkPrecedence: LinkPrecedence.PRIMARY,
    },
  });
  return contact;
}

export async function getPrimaryContactFromEmailAndPhoneNumber(
  email: string,
  phoneNumber: string
): Promise<Contact | null> {
  let primaryContact: Contact | null = null;
  let primaryEmail = await getPrimaryContactFromEmail(email);

  logger.info("EP - From Email", { primaryEmail: primaryEmail });
  if (!primaryEmail) {
    let primaryPhoneNumber = await getPrimaryContactFromPhoneNumber(
      phoneNumber
    );
    if (!primaryPhoneNumber) {
      return primaryContact;
    } else {
      primaryContact = primaryPhoneNumber;
      return primaryContact;
    }
  } else {
    primaryContact = primaryEmail;
  }
  return primaryContact;
}

export async function getContactResponseBody(id: number) {
  let contact = await prisma.contact.findUnique({
    where: {
      id: id,
    },
  });

  if (!contact) {
    throw new Error(`Contact with ID ${id} not found`);
  }
  let secondaryContacts = await getSecondaryContacts(id);

  let contactResponseBody: ContactResponseBody = {
    primaryContactId: contact.id,
    emails: contact.email ? [contact.email] : [],
    phoneNumbers: contact.phoneNumber ? [contact.phoneNumber] : [],
    secondaryContactIds: await getSecondaryContactsIds(secondaryContacts),
  };
  return contactResponseBody;
}

export async function getSimilarContacts(email?: string, phoneNumber?: string) {
  let similarContacts: Contact[] = [];
  if (email && phoneNumber) {
    similarContacts = await prisma.contact.findMany({
      where: {
        OR: [
          {
            email: email,
          },
          {
            phoneNumber: phoneNumber,
          },
        ],
      },
    });
  } else if (email && !phoneNumber) {
    similarContacts = await prisma.contact.findMany({
      where: {
        email: email,
      },
    });
  } else if (!email && phoneNumber) {
    similarContacts = await prisma.contact.findMany({
      where: {
        phoneNumber: phoneNumber,
      },
    });
  } else {
    return null;
  }
  return similarContacts;
}

export async function identificationService(
  email?: string,
  phoneNumber?: string
): Promise<ContactResponseBody | null> {
  let newContact = await createNewContact(email, phoneNumber);
  let similarContacts = await getSimilarContacts(email, phoneNumber);

  logger.info("Similar Contacts", { similarContacts: similarContacts });

  if (!similarContacts) {
    return null;
  }

  if (similarContacts.length == 0) {
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

  await primarySimilarContactCountCheck(similarContacts);
  let primaryContact: Contact | null = null;
  let secondaryContacts: Contact[] | null;
  if (email && phoneNumber) {
    primaryContact = await getPrimaryContactFromEmailAndPhoneNumber(
      email,
      phoneNumber
    );

    logger.info("Primary Contact E P", { primaryContact: primaryContact });
  } else if (email) {
    primaryContact = await getPrimaryContactFromEmail(email);

    logger.info("Primary Contact E", { primaryContact: primaryContact });
  } else if (phoneNumber) {
    primaryContact = await getPrimaryContactFromPhoneNumber(phoneNumber);

    logger.info("Primary Contact P", { primaryContact: primaryContact });
  }

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

export async function getSecondaryContacts(id: number) {
  await prisma.$disconnect();
  await prisma.$connect();
  let secondaryContacts = await prisma.contact.findMany({
    where: {
      linkedId: id,
      linkPrecedence: LinkPrecedence.SECONDARY,
    },
  });

  return secondaryContacts;
}

export async function getSecondaryContactsIds(
  secondaryContacts: Contact[]
): Promise<number[]> {
  const secondaryContactIds: number[] = secondaryContacts.map(
    (contact) => contact.id
  );

  return secondaryContactIds;
}

export async function getEmails(
  primaryContact: Contact,
  secondaryContacts: Contact[]
): Promise<string[]> {
  let emails: string[] = [];
  if (primaryContact.email) {
    emails.push(primaryContact.email);
  }
  secondaryContacts.forEach((contact) => {
    if (contact.email) {
      emails.push(contact.email);
    }
  });
  emails = [...new Set(emails)];

  return emails;
}

export async function getPhoneNumbers(
  primaryContact: Contact,
  secondaryContacts: Contact[]
): Promise<string[]> {
  let phoneNumbers: string[] = [];
  if (primaryContact.phoneNumber) {
    phoneNumbers.push(primaryContact.phoneNumber);
  }
  secondaryContacts.forEach((contact) => {
    if (contact.phoneNumber) {
      phoneNumbers.push(contact.phoneNumber);
    }
  });
  phoneNumbers = [...new Set(phoneNumbers)];
  return phoneNumbers;
}

export async function primarySimilarContactCountCheck(
  similarContacts: Contact[]
) {
  let primaryContactArray: Contact[] = [];

  primaryContactArray = similarContacts.filter(
    (contact) => contact.linkPrecedence === LinkPrecedence.PRIMARY
  );

  let primarySimilarContactCount = primaryContactArray.length;

  logger.info("Primary Similar Contact Count", {
    primarySimilarContactCount: primarySimilarContactCount,
  });

  if (primarySimilarContactCount > 1) {
    let oldestContact = primaryContactArray.reduce(
      (oldest, contact) =>
        contact.createdAt < oldest.createdAt ? contact : oldest,
      primaryContactArray[0]
    );

    logger.info("Oldest Contact", { oldestContact: oldestContact });

    await Promise.all(
      primaryContactArray.map(async (contact) => {
        if (contact.id !== oldestContact.id) {
          await prisma.contact.update({
            where: {
              id: contact.id,
            },
            data: {
              linkPrecedence: LinkPrecedence.SECONDARY,
              linkedId: oldestContact.id,
            },
          });
        }
      })
    );
  }
}
