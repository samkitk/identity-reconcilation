import { Contact, LinkPrecedence } from "@prisma/client";
import { prisma } from "../helpers/prisma";
import { logger } from "../helpers/winston";
import { getContactById } from "../identity/contact";

export async function PrismaTest(email: string, phoneNumber: string) {
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
  }
}

export async function PrismaTest2(email?: string, phoneNumber?: string) {
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
}
