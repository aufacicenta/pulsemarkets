import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, splat, colorize } = format;

const myFormat = printf((info) => {
  let { message } = info;

  if (info.level === "error") {
    message = info.message;
  } else if (typeof info.message === "object") {
    message = JSON.stringify(info.message, null, 2);
  }

  return `${info.timestamp} [${__filename}] ${info.level}: ${message}`;
});

const logger = createLogger({
  format: combine(format.errors({ stack: true }), timestamp(), myFormat, splat(), colorize()),
  transports: [new transports.Console()],
});

export default logger;
