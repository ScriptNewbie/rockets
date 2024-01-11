"use server";
import APIClient from "./APIClient";

interface Provider {
  id: number;
  name: string;
  slug: string;
}

interface Mission {
  id: number;
  name: string;
  description: string;
}

interface Vehicle {
  id: number;
  name: string;
}

interface LaunchResponse {
  id: number;
  name: string;
  provider: Provider;
  vehicle: Vehicle;
  slug: string;
  missions: Mission[];
  sort_date: number;
  result: -1 | 0 | 1 | 2 | 3 | null;
}

export interface Launch extends LaunchResponse {
  launched: boolean;
  date: Date;
}

const launchesClient = new APIClient<LaunchResponse>("launches");

const getLaunchesByParams = async (searchParams: Record<string, string>) => {
  const response = await launchesClient.get(searchParams);
  const nowUnixTimestamp = Date.now() / 1000;
  const launches = response.result.map((launch): Launch => {
    return {
      ...launch,
      launched: launch.sort_date < nowUnixTimestamp,
      date: new Date(launch.sort_date * 1000),
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

interface Query {
  vehicalId?: number;
  providerId?: number;
}

const getLaunches = async (
  limit: number,
  page: number,
  query: Query,
  additionalSearchParams: Record<string, string>
) => {
  const queryObject = {} as { vehical_id: string; provider_id: string };
  if (query.providerId !== undefined)
    queryObject.provider_id = query.providerId.toString();
  if (query.vehicalId !== undefined)
    queryObject.vehical_id = query.vehicalId.toString();

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
    before_date: now.toISOString(),
    direction: "desc",
  });
};
