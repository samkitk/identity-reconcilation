import express from "express";
import { logger } from "./helpers/winston";
import { host_environment, server_port } from "./helpers/environment";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(server_port, () => {
  logger.info(
    `Server started on port ${server_port} in ${host_environment} environment`
  );
});
