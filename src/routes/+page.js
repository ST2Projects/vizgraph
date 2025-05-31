// TODO load data from FS or URL and combine into uber json
export const load = async ({ fetch, params }) => {
  const response = await fetch('/api/data');

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = await response.json();

  return json;
};
