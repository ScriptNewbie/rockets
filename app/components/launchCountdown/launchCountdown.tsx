import React from "react";
import _LaunchCountdown from "./countdown";

function LaunchCountdown({ date }: { date: Date }) {
  return (
    <_LaunchCountdown
      date={date}
      initialCountdown={date.getTime() - Date.now()}
    />
  );
}

export default LaunchCountdown;
