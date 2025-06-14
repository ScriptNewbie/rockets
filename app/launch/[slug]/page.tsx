import LaunchCard from "@/app/components/launchCard";
import codeToState from "@/app/utils/codeToState";
import { getLaunch } from "@/app/services/launchesService";
import { notFound } from "next/navigation";
import React from "react";
import { LaunchDateWithCountdown } from "../../components/LaunchDateWithCountdown";
import getLaunchStatus from "@/app/utils/getLaunchStatus";
import Link from "../../components/Link";

import type { Launch } from "@/app/services/launchesService";

interface Props {
  params: { slug: string };
}

async function Launch({ params: { slug } }: Props) {
  const launch = await getLaunch(slug);
  if (!launch) notFound();

  return (
    <div className="m-5">
      <LaunchCard launch={launch} />
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 mx-auto">
        <LaunchDetails launch={launch} />
        <div className="flex flex-col gap-5">
          <LaunchDescription description={launch.launch_description} />
          <Missions launch={launch} />
        </div>
      </div>
    </div>
  );
}

function LaunchDescription({ description }: { description: string }) {
  return (
    <section>
      <h3 className="font-bold text-lg">Launch description</h3>
      <div>{description}</div>
    </section>
  );
}

function LaunchDetails({ launch }: { launch: Launch }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-bold text-lg">Launch details</h3>
      <DetailGroup title="Launching company">
        <Link href={"../provider/" + launch.provider.slug}>
          {launch.provider.name}
        </Link>
      </DetailGroup>
      <DetailGroup title="Vehicle">
        {" "}
        <Link href={"../vehicle/" + launch.vehicle.slug}>
          {launch.vehicle.name}
        </Link>
      </DetailGroup>
      <LaunchSite launch={launch} />
      <DetailGroup title="Launch date">
        <LaunchDateWithCountdown launch={launch} />
      </DetailGroup>
      <DetailGroup title="Status">
        <LaunchStatus launch={launch} />
      </DetailGroup>
    </section>
  );
}

function DetailGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="opacity-75">{title + ":"}</div>
      <div>{children}</div>
    </div>
  );
}

function Missions({ launch: { missions } }: { launch: Launch }) {
  {
    return (
      <>
        {missions?.[0]?.description && (
          <section className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Missions</h3>
            {missions?.map((mission) => (
              <DetailGroup key={mission.id} title={mission.name}>
                {mission.description}
              </DetailGroup>
            ))}
          </section>
        )}
      </>
    );
  }
}

function LaunchSite({ launch: { pad } }: { launch: Launch }) {
  {
    return (
      <DetailGroup title="Launch site">
        {`${pad.location.name}, ${pad.name} (${
          pad.location.state ? codeToState(pad.location.state) + ", " : ""
        }${pad.location.country})`}
      </DetailGroup>
    );
  }
}

function LaunchStatus({ launch }: { launch: Launch }) {
  const status = getLaunchStatus(launch);
  {
    return <span className={"text-" + status.color}>{status.name}</span>;
  }
}

export default Launch;
