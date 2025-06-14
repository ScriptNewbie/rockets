import APIClient from "./APIClient";

export interface VehicleResponse {
  id: number;
  name: string;
}

export interface Vehicle extends VehicleResponse {
  slug: string;
}

const vehiclesClient = new APIClient<Vehicle>("vehicles");

export const getVehicle = async (slug: string) => {
  const name = slug.split("-").join(" ");
  const { result } = await vehiclesClient.get({ name });
  if (result.length > 0) return result[0];
  return null;
};
