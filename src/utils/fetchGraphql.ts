import { ApiResponse } from '@/models';

export async function fetchGraphql(
  url: string,
  query: string,
  variables: object = {}
): Promise<ApiResponse> {
  if (!url) {
    return {
      status: 400,
      data: null,
    };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const { data } = await res.json();
  return {
    status: res.status,
    data,
  };
}
