import APIClient from "./APIClient";

export interface ProviderResponse {
  id: number;
  name: string;
}

export interface Provider extends ProviderResponse {
  slug: string;
}

const providersClient = new APIClient<Provider>("companies");

export const getProvider = async (slug: string) => {
  const name = slug.split("-").join(" ");
  const { result } = await providersClient.get({ name });
  if (result.length > 0) return result[0];
  return null;
};
