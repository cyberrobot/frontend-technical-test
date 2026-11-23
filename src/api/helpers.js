/**
 * A utility function to make a network api call
 *
 * @param {string} apiUrl
 * @return {Promise<Object>}
 */
export async function request(apiUrl) {
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${apiUrl}`);
  }

  return response.json();
}
