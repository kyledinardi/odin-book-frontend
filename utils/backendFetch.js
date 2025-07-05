/* eslint-disable no-console */
function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (err) {
    return false;
  }

  return true;
}

async function backendFetch(setError, path, options) {
  let hasBearer = true;
  let method;
  let body;
  let Authorization;

  if (options) {
    ({ method, body } = options);
    hasBearer = options.hasBearer !== false;
  }

  if (hasBearer) {
    Authorization = `Bearer ${localStorage.getItem('token')}`;
  }

  const headers = { Authorization };

  if (isJsonString(body)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    let response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${path}`, {
      headers,
      method,
      body,
    });

    response = await response.json();

    if (response.error) {
      setError(response.error);
    } else {
      return response;
    }
  } catch (err) {
    console.error(err);
    setError({ status: 'Error', message: 'An unexpected error has occured' });
  }

  return null;
}

export default backendFetch;
