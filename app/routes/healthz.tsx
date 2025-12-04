import { createRoute } from "honox/factory";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;

  logger.info({
    operation: "healthz/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Health check requested",
  });

  try {
    // 軽量なクエリで DB 接続を確認
    await sql`SELECT 1`;

    logger.info({
      operation: "healthz/GET",
      message: "Health check succeeded",
      db: "up",
    });

    return c.json(
      {
        status: "ok",
        db: "up",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logger.error({
      operation: "healthz/GET",
      message: "Health check failed",
      db: "down",
      error,
    });

    return c.json(
      {
        status: "error",
        db: "down",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
)
;


