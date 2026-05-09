import type { Launch } from "../services/launchesService";
import codeToState from "./codeToState";

const PROD_ID = "-//rockets//Launch Calendar//EN";
const UID_DOMAIN = "rockets.app";
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

const escapeText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const pad = (n: number): string => n.toString().padStart(2, "0");

const formatUtcDate = (date: Date): string =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
    date.getUTCSeconds(),
  )}Z`;

// RFC 5545 says lines must be folded at 75 octets with CRLF + single space.
// 73 is conservative for multi-byte UTF-8 characters.
const foldLine = (line: string): string => {
  if (line.length <= 75) return line;
  const max = 73;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += max) {
    parts.push(line.slice(i, i + max));
  }
  return parts.join("\r\n ");
};

const line = (key: string, value: string): string => foldLine(`${key}:${value}`);

const buildLocation = (launch: Launch): string => {
  const { pad: launchPad } = launch;
  const stateName = launchPad.location.state
    ? codeToState(launchPad.location.state)
    : null;
  const segments = [
    launchPad.name,
    launchPad.location.name,
    stateName,
    launchPad.location.country,
  ].filter((segment): segment is string => Boolean(segment));
  return segments.join(", ");
};

const buildDescription = (launch: Launch, siteUrl: string | null): string => {
  const lines: string[] = [];
  if (launch.launch_description) lines.push(launch.launch_description);

  const missionDescriptions = launch.missions
    ?.map((mission) => {
      if (!mission?.name) return null;
      return mission.description
        ? `${mission.name}: ${mission.description}`
        : mission.name;
    })
    .filter((entry): entry is string => Boolean(entry));

  if (missionDescriptions && missionDescriptions.length > 0) {
    lines.push("");
    lines.push("Missions:");
    lines.push(...missionDescriptions);
  }

  if (siteUrl) {
    lines.push("");
    lines.push(`More info: ${siteUrl}/launch/${launch.slug}`);
  }

  return lines.join("\n");
};

const buildEvent = (
  launch: Launch,
  now: Date,
  siteUrl: string | null,
): string[] => {
  const start = launch.date;
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);

  const summary = `${launch.vehicle.name} – ${launch.name} (${launch.provider.name})`;
  const description = buildDescription(launch, siteUrl);
  const location = buildLocation(launch);

  const event: string[] = [
    "BEGIN:VEVENT",
    line("UID", `launch-${launch.id}@${UID_DOMAIN}`),
    line("DTSTAMP", formatUtcDate(now)),
    line("DTSTART", formatUtcDate(start)),
    line("DTEND", formatUtcDate(end)),
    line("SUMMARY", escapeText(summary)),
    line("DESCRIPTION", escapeText(description)),
  ];

  if (location) event.push(line("LOCATION", escapeText(location)));
  if (siteUrl) event.push(line("URL", `${siteUrl}/launch/${launch.slug}`));

  event.push(
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    line("DESCRIPTION", escapeText(`Upcoming launch: ${summary}`)),
    "TRIGGER:-PT30M",
    "END:VALARM",
    "END:VEVENT",
  );

  return event;
};

export interface BuildIcsFeedOptions {
  launches: Launch[];
  calendarName?: string;
  calendarDescription?: string;
  /** Refresh hint for clients that honour it (iOS Calendar respects this). */
  refreshIntervalMinutes?: number;
  /** Absolute base URL of the site, used to build event URLs. */
  siteUrl?: string | null;
}

export const buildIcsFeed = ({
  launches,
  calendarName = "Rocket Launches",
  calendarDescription = "Upcoming rocket launches across all providers.",
  refreshIntervalMinutes = 60,
  siteUrl = null,
}: BuildIcsFeedOptions): string => {
  const now = new Date();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    line("PRODID", PROD_ID),
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    line("X-WR-CALNAME", escapeText(calendarName)),
    line("X-WR-CALDESC", escapeText(calendarDescription)),
    line("NAME", escapeText(calendarName)),
    line("DESCRIPTION", escapeText(calendarDescription)),
    `X-PUBLISHED-TTL:PT${refreshIntervalMinutes}M`,
    `REFRESH-INTERVAL;VALUE=DURATION:PT${refreshIntervalMinutes}M`,
  ];

  for (const launch of launches) {
    if (!launch.date || Number.isNaN(launch.date.getTime())) continue;
    lines.push(...buildEvent(launch, now, siteUrl));
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n") + "\r\n";
};
