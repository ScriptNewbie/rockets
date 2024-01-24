import React from "react";

function LaunchDate({ date }: { date: Date }) {
  return (
    <span>
      {date
        .toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
        .replace(/,/, "")}
    </span>
  );
}

export default LaunchDate;
