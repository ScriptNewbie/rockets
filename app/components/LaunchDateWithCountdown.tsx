import LaunchCountdown from "@/app/components/launchCountdown";
import LaunchDate from "@/app/components/launchDate";
import { Launch } from "@/app/services/launchesService";

export function LaunchDateWithCountdown({ launch }: { launch: Launch }) {
  return (
    <>
      <LaunchDate date={launch.date} />{" "}
      {!launch.launched && (
        <>
          (<LaunchCountdown date={launch.date} />)
        </>
      )}
    </>
  );
}
