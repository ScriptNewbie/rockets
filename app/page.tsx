import Link from "./components/Link";
import LaunchCard from "./components/launchCard";
import {
  getFutureLaunches,
  getLaunch,
  getPastLaunches,
} from "./services/launchesService";

export default async function Home() {
  const futureLaunches = await getFutureLaunches(25, 1);
  const pastLaunches = await getPastLaunches(25, 1);

  return (
    <main>
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 mx-auto">
        <div>
          <h2 className="text-lg">Previous Launches</h2>
          {pastLaunches.result.map((launch) => (
            <div className="mt-2" key={launch.id}>
              <Link href={"launch/" + launch.slug}>
                <LaunchCard withDate launch={launch} />
              </Link>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-lg">Upcoming Launches</h2>
          {futureLaunches.result.map((launch) => (
            <div className="mt-2" key={launch.id}>
              <Link href={"launch/" + launch.slug}>
                <LaunchCard withDate launch={launch} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
