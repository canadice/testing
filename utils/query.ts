export const query = async (
  uri: string,
  options?: {
    headers: Record<string, string>;
  },
  isIndexQuery?: boolean,
) => {
  const response = await fetch(
    `${
      isIndexQuery
        ? 'https://index.simulationhockey.com'
        : process.env.NEXT_PUBLIC_API_ENDPOINT
    }/${uri}`,
    {
      method: 'GET',
      headers: options?.headers,
    },
  );

  if (!response.ok) {
    return Promise.reject({
      message: await response.text(),
      status: response.status,
    });
  }

  return response.json();
};

export const mutate = async (
  uri: string,
  data: Record<string, unknown>,
  options?: {
    headers: Record<string, string>;
  },
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${uri}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    return Promise.reject({
      message: await response.text(),
      status: response.status,
    });
  }

  return response.json();
};
