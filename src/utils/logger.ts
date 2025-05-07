import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

// Formato personalizado para consola
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}]: ${message}`;
});

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console({
      format: combine(timestamp(), consoleFormat), // Aplica formato personalizado
    }),
  ],
});

logger.add(
  new transports.File({
    filename: "error.log",
    level: "error",
    format: combine(timestamp(), format.json()), // Archivo en formato JSON
  })
);

logger.log("info", "Logger initialized");

export default logger;
