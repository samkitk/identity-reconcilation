import express from "express";
import { logger } from "./helpers/winston";
import { host_environment, server_port } from "./helpers/environment";
import git from "git-last-commit";

const app = express();

app.get("/", (req, res) => {
  git.getLastCommit((err, commit) => {
    if (err) {
      logger.log("error", err);
      return res.send("Hello World!");
    }
    return res.send("Hello World! " + commit.shortHash);
  });
});

app.listen(server_port, () => {
  logger.info(
    `Server started on port ${server_port} in ${host_environment} environment`
  );
});
