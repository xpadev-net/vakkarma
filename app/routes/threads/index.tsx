import { createRoute } from "honox/factory";

import { postThreadUsecase } from "../../../src/conversation/usecases/postThreadUsecase";
import { ErrorMessage } from "../../components/ErrorMessage";
import { resolveBoardContext } from "../../utils/getBoardContext";
import { getIpAddress } from "../../utils/getIpAddress";

 
export const POST = createRoute(async (c) => {
  const { sql, logger } = c.var;
  const vakContext = { sql, logger };
  const boardSlug = c.req.param("boardSlug");

  logger.info({
    operation: "threads/POST",
    path: c.req.path,
    method: c.req.method,
    message: "Starting new thread creation request"
  });

  const body = await c.req.parseBody();
  const title = body.title;
  const name = typeof body.name === "string" ? body.name : null;
  const mail = typeof body.mail === "string" ? body.mail : null;
  const content = body.content;

  logger.debug({
    operation: "threads/POST",
    hasTitle: typeof title === "string",
    hasContent: typeof content === "string",
    hasName: name !== null,
    hasMail: mail !== null,
    message: "Request body parsed for thread creation"
  });

  if (typeof title !== "string" || typeof content !== "string") {
    logger.warn({
      operation: "threads/POST",
      validationError: "Missing required fields",
      hasTitle: typeof title === "string",
      hasContent: typeof content === "string",
      message: "Thread creation validation failed - missing required fields"
    });
    return c.render(
      <ErrorMessage error={new Error("タイトルと本文は必須です")} />
    );
  }

  const ipAddressRaw = getIpAddress(c);
  
  logger.debug({
    operation: "threads/POST",
    ipAddress: ipAddressRaw,
    message: "IP address extracted for thread creation"
  });

  const boardContextResult = await resolveBoardContext(vakContext, boardSlug);
  if (boardContextResult.isErr()) {
    logger.error({
      operation: "threads/POST",
      error: boardContextResult.error,
      message: "Failed to resolve board context",
    });
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  const postThreadResult = await postThreadUsecase(
    vakContext,
    boardContextResult.value,
    {
      threadTitleRaw: title,
      authorNameRaw: name,
      mailRaw: mail,
      responseContentRaw: content,
      ipAddressRaw,
    }
  );
  if (postThreadResult.isErr()) {
    logger.error({
      operation: "threads/POST",
      error: postThreadResult.error,
      message: "Thread creation failed in usecase layer"
    });
    return c.render(<ErrorMessage error={postThreadResult.error} />);
  }
  const threadId = postThreadResult.value.val;

  logger.info({
    operation: "threads/POST",
    threadId,
    boardSlug: boardSlug ?? "(default)",
    message: "Thread created successfully, redirecting to thread page",
  });

  const redirectBase = boardSlug
    ? `/boards/${boardSlug}`
    : `/boards/${boardContextResult.value.slug}`;

  return c.redirect(`${redirectBase}/threads/${threadId}`, 303);
});

export default createRoute((c) => {
  const { logger } = c.var;
  const boardSlug = c.req.param("boardSlug");
  
  logger.debug({
    operation: "threads/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Thread index page requested, redirecting to home page"
  });
  
  if (boardSlug) {
    return c.redirect(`/boards/${boardSlug}`, 302);
  }

  return c.redirect("/", 302);
});
