import { getPrimaryContactFromEmailAndPhoneNumber } from "../identity/contact";

test("getPrimaryContactFromEmail should retrieve the primary contact with the given email", async () => {
  const contact = await getPrimaryContactFromEmailAndPhoneNumber(
    "test@example.com"
  );
  expect(contact).toBeDefined();
  expect(contact?.email).toBe("test@example.com");
  expect(contact?.phoneNumber).toBe("1234567890");
  expect(contact?.linkPrecedence).toBe("PRIMARY" || "SECONDARY");
});
