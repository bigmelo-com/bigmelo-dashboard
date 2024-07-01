import { ValidationError } from "../validate";

/**
 * Errors that happen in the loader should be thrown and caught by the client-side ErrorBoundary.
 *
 * ValidationErrors should still be thrown (rather than passed to the page), because if it's happening in the loader,
 * it's likely a problem with the server, not the user's input.
 */
export default function handleLoaderError(error: unknown) {
  /**
   * In remix if you throw a Response object, it is the same as a loader/action returning that Response.
   * We don't want to block that behavior, so we re-throw the Response.
   * This is useful for handling errors in utils that are used in loaders/actions.
   */
  if (error instanceof Response) {
    throw error;
  }

  const message =
    error instanceof Error || error instanceof ValidationError
      ? error.message
      : "An unknown error occurred.";

  throw new Response(message, { status: 500 });
}
