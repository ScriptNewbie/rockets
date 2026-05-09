import Link from "./components/Link";
import LaunchCard from "./components/launchCard";
import SubscribeButton from "./components/SubscribeButton";
import { getFutureLaunches, getPastLaunches } from "./services/launchesService";

export default async function Home() {
  const futureLaunches = await getFutureLaunches(25, 1);
  const pastLaunches = await getPastLaunches(25, 1);

  return (
    <main>
      <div className="container mx-auto mt-5 flex flex-col items-center gap-2 px-5 text-center">
        <p className="text-sm text-slate-300">
          Add upcoming launches to your iPhone, Mac or Google Calendar.
        </p>
        <SubscribeButton />
      </div>
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 mx-auto">
        <div className="order-2 lg:order-1">
          <h2 className="text-lg">Previous Launches</h2>
          {pastLaunches.result.map((launch) => (
            <div className="mt-2 opacity-90 hover:opacity-100" key={launch.id}>
              <Link href={"/launch/" + launch.slug}>
                <LaunchCard withDate launch={launch} />
              </Link>
            </div>
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-lg">Upcoming Launches</h2>
          {futureLaunches.result.map((launch) => (
            <div className="mt-2 opacity-90 hover:opacity-100" key={launch.id}>
              <Link href={"/launch/" + launch.slug}>
                <LaunchCard withDate launch={launch} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
