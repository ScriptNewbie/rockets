import { getFutureLaunches } from "../services/launchesService";
import { buildIcsFeed } from "../utils/buildIcsFeed";

// Refresh the cached feed every hour. iOS Calendar refreshes subscribed
// calendars on its own cadence (typically hourly), so this is a sensible match.
export const revalidate = 3600;

const FEED_LIMIT = 100;
const SITE_URL = "https://rockets.zttw.it";

export async function GET() {
  const response = await getFutureLaunches(FEED_LIMIT, 1);
  const upcoming = response.result.filter((launch) => !launch.launched);

  const ics = buildIcsFeed({
    launches: upcoming,
    calendarName: "Rocket Launches",
    calendarDescription:
      "Upcoming rocket launches from rocketlaunch.live, across all providers.",
    refreshIntervalMinutes: 60,
    siteUrl: SITE_URL,
  });

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="launches.ics"',
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
