import { LinkPrecedence, Contact } from "@prisma/client";
import { prisma } from "../helpers/prisma";
import { logger } from "../helpers/winston";
import { ContactResponseBody } from "../helpers/interfaces";
import { get } from "http";

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
          await secondaryContactsToNewPrimaryContact(contact.id);
        }
      })
    );
  }
}

export async function getContactById(id: number): Promise<Contact | null> {
  let contact = await prisma.contact.findUnique({
    where: {
      id: id,
    },
  });
  return contact;
}

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

export async function getPrimaryContactFromEmailAndPhoneNumber(
  email?: string,
  phoneNumber?: string
): Promise<Contact | null> {
  let nc = await prisma.contact.findFirst({
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
  if (nc) {
    if (nc?.linkPrecedence === LinkPrecedence.PRIMARY) {
      return nc;
    } else if (nc?.linkPrecedence === LinkPrecedence.SECONDARY) {
      if (nc.linkedId) {
        let primaryContactFromLinkedId = await getContactById(nc.linkedId);
        return primaryContactFromLinkedId;
      }
    }
    return nc;
  }
  return nc;
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
  let nc = await prisma.contact.findMany({
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

  if (!nc) {
    return null;
  }

  let similarContacts: Contact[] = [];

  await Promise.all(
    nc.map(async (contact) => {
      if (contact.linkedId) {
        let linkedContact = await getContactById(contact.linkedId);
        if (linkedContact) {
          similarContacts.push(linkedContact);
        }
      }
      similarContacts.push(contact);
    })
  );
  console.log(
    "Similar Contacts Full IDs",
    await getSecondaryContactsIds(similarContacts)
  );
  return similarContacts;
}

export async function secondaryContactsToNewPrimaryContact(id: number) {
  //   await prisma.$disconnect();
  //   await prisma.$connect();
  let secondaryContacts = await getSecondaryContacts(id);

  let oldPrimaryContact = await getContactById(id);

  if (oldPrimaryContact) {
    await Promise.all(
      secondaryContacts.map(async (contact) => {
        await prisma.contact.update({
          where: {
            id: contact.id,
          },
          data: {
            linkedId: oldPrimaryContact?.linkedId,
          },
        });
      })
    );
  }
}
