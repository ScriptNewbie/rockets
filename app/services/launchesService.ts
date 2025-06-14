"use server";
import { StateCode } from "../utils/codeToState";
import { Provider, ProviderResponse } from "./providersService";
import APIClient from "./APIClient";

interface Mission {
  id: number;
  name: string;
  description: string;
}

interface Vehicle {
  id: number;
  name: string;
  slug: string;
}

interface Location {
  id: number;
  name: string;
  country: string;
  state: StateCode;
}

interface Pad {
  id: number;
  name: string;
  location: Location;
}

interface LaunchResponse {
  id: number;
  name: string;
  provider: ProviderResponse;
  vehicle: Vehicle;
  slug: string;
  missions: Mission[];
  sort_date: number;
  launch_description: string;
  pad: Pad;
  result: -1 | 0 | 1 | 2 | 3 | null;
}

interface Query {
  vehicleId?: number;
  providerId?: number;
}

export interface Launch extends LaunchResponse {
  launched: boolean;
  date: Date;
  provider: Provider;
}

const launchesClient = new APIClient<LaunchResponse>("launches", 10);

const getLaunchesByParams = async (searchParams: Record<string, string>) => {
  const response = await launchesClient.get(searchParams);
  const nowUnixTimestamp = Date.now() / 1000;
  const launches = response.result.map((launch): Launch => {
    return {
      ...launch,
      launched: launch.sort_date < nowUnixTimestamp,
      date: new Date(launch.sort_date * 1000),
      provider: {
        ...launch.provider,
        slug: launch.provider.name.split(" ").join("-").toLowerCase(),
      },
      vehicle: {
        ...launch.vehicle,
        slug: launch.vehicle.name.split(" ").join("-").toLowerCase(),
      },
    };
  });
  return { ...response, result: launches };
};

export const getLaunch = async (slug: string): Promise<Launch | null> => {
  const response = await getLaunchesByParams({ slug });
  const launch = response.result;
  if (launch.length > 0) return launch[0];
  return null;
};

const getLaunches = async (
  limit: number,
  page: number,
  query: Query,
  additionalSearchParams: Record<string, string>
) => {
  const queryObject = {} as { vehicle_id?: string; provider_id?: string };
  if (query.providerId !== undefined)
    queryObject.provider_id = query.providerId.toString();
  if (query.vehicleId !== undefined)
    queryObject.vehicle_id = query.vehicleId.toString();

  return getLaunchesByParams({
    limit: limit.toString(),
    page: page.toString(),
    ...additionalSearchParams,
    ...queryObject,
  });
};

export const getFutureLaunches = (limit = 25, page = 1, query: Query = {}) => {
  return getLaunches(limit, page, query, {});
};

export const getPastLaunches = (limit = 25, page = 1, query: Query = {}) => {
  const now = new Date();
  return getLaunches(limit, page, query, {
    before_date: now.toISOString().split("T")[0],
    direction: "desc",
  });
};
