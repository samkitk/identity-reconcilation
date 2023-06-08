import { createNewContact } from "../src/identity/contact";

test("createNewContact should create a new contact", async () => {
  const newContact = await createNewContact("test@example.com", "1234567890");
  expect(newContact).toBeDefined();
  expect(newContact?.email).toBe("test@example.com");
  expect(newContact?.phoneNumber).toBe("1234567890");
});
