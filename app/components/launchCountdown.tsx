"use client";
import React, { useEffect, useState } from "react";

function LaunchCountdown({ date }: { date: Date }) {
  const [countdown, setCountdown] = useState(date.getTime() - Date.now());

  const days = Math.floor(countdown / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (countdown % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const minutes = Math.floor((countdown % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((countdown % (60 * 1000)) / 1000);

  const addLeadingDigit = (number: number) => {
    return number < 10 ? "0" + number : number.toString();
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setCountdown(date.getTime() - Date.now());
    }, 1000);
    return () => {
      clearInterval(countdown);
    };
  }, [date]);

  if (countdown < 0) return null;
  return (
    <span suppressHydrationWarning className="tabular-nums text-lime-400">
      T-
      {days > 0 ? (
        <>{days} days</>
      ) : (
        <>
          {addLeadingDigit(hours)}:{addLeadingDigit(minutes)}:
          {addLeadingDigit(seconds)}
        </>
      )}
    </span>
  );
}

export default LaunchCountdown;
