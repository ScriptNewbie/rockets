import React from "react";

function LaunchDate({ date }: { date: Date }) {
  return (
    <div>
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
    </div>
  );
}

export default LaunchDate;
