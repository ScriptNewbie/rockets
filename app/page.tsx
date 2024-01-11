import {
  getFutureLaunches,
  getLaunch,
  getPastLaunches,
} from "./services/launchesService";

export default async function Home() {
  const launches = await getFutureLaunches(25, 1, { providerId: undefined });

  return (
    <main>
      {launches.result.map((launch) => (
        <div>{launch.vehicle.name}</div>
      ))}
    </main>
  );
}
