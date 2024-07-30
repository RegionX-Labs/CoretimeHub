export async function fetchGraphql(url: string, query: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });
  return res;
}
