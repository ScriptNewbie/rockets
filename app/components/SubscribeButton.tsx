"use client";

import { useEffect, useState } from "react";

const FEED_PATH = "/launches.ics";

function SubscribeButton() {
  const [webcalUrl, setWebcalUrl] = useState<string | null>(null);
  const [httpsUrl, setHttpsUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { host, protocol } = window.location;
    setWebcalUrl(`webcal://${host}${FEED_PATH}`);
    setHttpsUrl(`${protocol}//${host}${FEED_PATH}`);
  }, []);

  const handleCopy = async () => {
    if (!httpsUrl) return;
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this URL into your calendar app:", httpsUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
      <a
        href={webcalUrl ?? FEED_PATH}
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800"
      >
        Subscribe in Calendar
      </a>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!httpsUrl}
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
      >
        {copied ? "Copied!" : "Copy feed URL"}
      </button>
    </div>
  );
}

export default SubscribeButton;
