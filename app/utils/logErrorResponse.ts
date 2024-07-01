export default function logErrorResponse(response: Response) {
  if (
    (response.status >= 200 && response.status < 400) ||
    response.status === 404
  ) {
    return;
  }

  if (!(response.text instanceof Function)) {
    // skip logging when testing, (and using mocks for responses)
    return;
  }

  // Errors between 2 backend services should always be logged for troubleshooting.
  response.text().then((text) => {
    console.error(
      `${response.status} status from API [${response.url}]: `,
      text,
    );
  });
}
