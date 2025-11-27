import { logger } from "hono/logger";
import { type PinoLogger, pinoLogger } from "hono-pino";
import { createRoute } from "honox/factory";

import { csrf } from "../middlewares/csrfMiddleware";
import {
  type DbClient,
  dbClientMiddlewareConditional,
} from "../middlewares/dbInitializeMiddleware";

// CSRF許可オリジンは環境変数で上書きし、未設定なら従来どおり自動判定
const csrfAllowedOriginEnv = process.env.CSRF_ALLOWED_ORIGIN ?? "";
const csrfAllowedOrigins = csrfAllowedOriginEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const csrfOptions =
  csrfAllowedOrigins.length === 0
    ? undefined
    : {
        origin: csrfAllowedOrigins,
      };

export default createRoute(
  pinoLogger({
    pino: {
      level: "warn",
    },
  }),
  logger(),
  csrf(csrfOptions),
  dbClientMiddlewareConditional({
    envKey: "DATABASE_URL",
    contextKey: "sql",
  }),
);

declare module "hono" {
  interface ContextVariableMap {
    logger: PinoLogger;
    sql: DbClient;
  }
}
