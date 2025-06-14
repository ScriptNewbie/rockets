import { notFound } from "next/navigation";
import { getPastLaunches } from "@/app/services/launchesService";
import { getFutureLaunches } from "@/app/services/launchesService";
import Link from "@/app/components/Link";
import LaunchCard from "@/app/components/launchCard";
import { getVehicle } from "@/app/services/vehiclesService";

interface Props {
  params: { slug: string };
}

export default async function Rocket({ params: { slug } }: Props) {
  const rocket = await getVehicle(slug);
  if (!rocket) notFound();

  const futureLaunches = await getFutureLaunches(25, 1, {
    vehicleId: rocket.id,
  });
  const pastLaunches = await getPastLaunches(25, 1, {
    vehicleId: rocket.id,
  });

  return (
    <main>
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 mx-auto">
        <div className="order-2 lg:order-1">
          <h2 className="text-lg">Previous {rocket.name} Launches</h2>
          {pastLaunches.result.map((launch) => (
            <div className="mt-2 opacity-90 hover:opacity-100" key={launch.id}>
              <Link href={"/launch/" + launch.slug}>
                <LaunchCard withDate launch={launch} />
              </Link>
            </div>
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-lg">Upcoming {rocket.name} Launches</h2>
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
