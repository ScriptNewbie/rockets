import React from "react";
import { Launch } from "../services/launchesService";
import LaunchDate from "./launchDate";
import LaunchCountdown from "./launchCountdown";
import getLaunchStatus from "../utils/getLaunchStatus";

interface Props {
  launch: Launch;
  withDate?: boolean;
}

function LaunchCard({ launch, withDate }: Props) {
  const status = getLaunchStatus(launch);

  return (
    <article
      className={`flex flex-col w-full text-center p-5 rounded-xl bg-${status.color}`}
    >
      {withDate && (
        <span className="text-sm text-slate-300 mb-1">
          <LaunchDate date={launch.date} />
        </span>
      )}
      <div className="text-lg text-slate-200">{launch.vehicle.name}</div>
      <div className="text-4xl">{launch.name}</div>
      <div className="text-lg text-slate-200">{launch.provider.name}</div>
      {withDate && (
        <div className="flex justify-end">
          <LaunchCountdown date={launch.date} />
        </div>
      )}
    </article>
  );
}

export default LaunchCard;
