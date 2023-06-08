import express from "express";
import { logger } from "./helpers/winston";
import { host_environment, server_port } from "./helpers/environment";
import git from "git-last-commit";
import { identificationService } from "./identity/identity";
import { validateEmail, validatePhoneNumberDigits } from "./helpers/validator";
import { rateLimitMiddleware } from "./middleware/ratelimit";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  git.getLastCommit(async (err, commit) => {
    if (err) {
      logger.log("error", err);
      return res.send("Hello World!");
    }
    return res.send("Hello World! " + commit.shortHash);
  });
});

app.post("/identify", rateLimitMiddleware(5, 20), async (req, res) => {
  let { email, phoneNumber } = req.body;

  logger.log("info", "HMMM OK");
  console.log("OKOKOKOKO");

  if (!email && !phoneNumber) {
    return res
      .status(400)
      .send({ error: "Must provide either email or phone number" });
  }

  if (typeof email !== "string" || typeof phoneNumber !== "string") {
    return res
      .status(400)
      .send({ error: "Must provide both email and phone number in string" });
  }

  let is_email_valid = await validateEmail(email);
  console.log("TEST TEST", is_email_valid);

  let is_phone_valid = await validatePhoneNumberDigits(phoneNumber);
  console.log("MEST MEST", is_phone_valid);

  if (email && !is_email_valid) {
    return res.status(400).send({ error: "Invalid email" });
  }

  if (phoneNumber && !is_phone_valid) {
    return res.status(400).send({ error: "Invalid phone number" });
  }

  logger.info("Processing Data", { email: email, phoneNumber: phoneNumber });

  try {
    let response = await identificationService(email, phoneNumber);
    logger.info("--Response--", { response: response });
    return res.status(200).json({ contact: response });
  } catch (error: any) {
    logger.error("Error in Identifying", {
      Error: error.message,
      Stack: error.stack,
    });
    return res.status(404).json({
      contact: {
        error: error.message,
      },
    });
  }
});

app.listen(server_port, () => {
  logger.info(
    `Server started on port ${server_port} in ${host_environment} environment`
  );
});
