/* eslint-disable no-console */
const logError = (error: unknown) =>
  console.error(JSON.stringify(error, null, 2));

export default logError;
