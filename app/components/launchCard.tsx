import React from "react";
import { Launch } from "../services/launchesService";

interface Props {
  launch: Launch;
}

function LaunchCard({ launch }: Props) {
  if (launch.result === null) launch.result = -1;
  const result = {
    "-1": {
      name: launch.launched ? "Unknown" : "Waiting for launch",
      color: launch.launched ? "green-500" : "blue-500",
    },
    "0": { name: "Failure", color: "red-500" },
    "1": { name: "Success", color: "green-600" },
    "2": { name: "Partial failure", color: "orange-500" },
    "3": { name: "In-Flight Abort (Crewed)", color: "yellow-500" },
  };

  return (
    <article
      className={`flex flex-col w-full text-center p-5 rounded-xl bg-${
        result[launch.result].color
      }`}
    >
      <div className="text-lg text-slate-200">{launch.vehicle.name}</div>
      <div className="text-4xl">{launch.name}</div>
      <div className="text-lg text-slate-200">{launch.provider.name}</div>
    </article>
  );
}

export default LaunchCard;
