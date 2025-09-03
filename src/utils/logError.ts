/* eslint-disable no-console */
const logError = (error: unknown) => {
  const message = JSON.stringify(error, null, 2);

  if (message === '{}') {
    console.error(error);
  } else {
    console.error(message);
  }
};

export default logError;
