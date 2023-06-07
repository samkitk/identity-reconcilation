import express, { response } from "express";
import { logger } from "./helpers/winston";
import { host_environment, server_port } from "./helpers/environment";
import git from "git-last-commit";
import {
  createNewContact,
  getSimilarContacts,
  identificationService,
} from "./identity/identity";
import { validateEmail } from "./helpers/validator";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  git.getLastCommit((err, commit) => {
    if (err) {
      logger.log("error", err);
      return res.send("Hello World!");
    }
    return res.send("Hello World! " + commit.shortHash);
  });
});

app.post("/identify", async (req, res) => {
  let { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res
      .status(400)
      .send({ error: "Must provide either email or phone number" });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).send({ error: "Invalid email" });
  }

  // if phonenumber is int then convert to string

  if (phoneNumber && typeof phoneNumber === "number") {
    phoneNumber = phoneNumber.toString();
  }

  logger.info("Processing Data", { email: email, phoneNumber: phoneNumber });

  try {
    let response = await identificationService(email, phoneNumber);
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
