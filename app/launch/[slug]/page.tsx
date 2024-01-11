import LaunchCard from "@/app/components/launchCard";
import LaunchCountdown from "@/app/components/launchCountdown";
import LaunchDate from "@/app/components/launchDate";
import { getLaunch } from "@/app/services/launchesService";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: { slug: string };
}

async function Launch({ params: { slug } }: Props) {
  const launch = await getLaunch(slug);
  if (!launch) notFound();

  return (
    <div className="m-5">
      <div className="flex justify-center">
        <LaunchCard launch={launch} />
      </div>
      <LaunchDate date={launch.date} />
      {!launch.launched && <LaunchCountdown date={launch.date} />}
    </div>
  );
}

export default Launch;
