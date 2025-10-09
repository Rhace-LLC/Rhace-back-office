export const getConfig = (
  url: string,
  method: string,
  token?: string,
  data?: any,
  params?: any
) => {
  return {
    url,
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { data }),
    ...(params && { params }),
  };
};
