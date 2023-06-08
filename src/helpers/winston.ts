import winston from "winston";
const { combine, timestamp, printf, colorize, align, json, cli, prettyPrint } =
  winston.format;

import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { host_environment, logtail_token } from "./environment";

const logtail = new Logtail(logtail_token);

const devLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json(), align()),
  transports: [new winston.transports.Console()],
});

const prodLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    json()
  ),
  transports: [new winston.transports.Console(), new LogtailTransport(logtail)],
});

export const logger =
  host_environment === "development" ? devLogger : prodLogger;
