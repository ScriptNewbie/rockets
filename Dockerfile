# syntax=docker.io/docker/dockerfile:1

# Pin the October 2026 Node.js security release. node:24-alpine currently
# resolves to this same image (24.22.1, sha256:06d7adf3e0ef...), but a
# floating tag can reuse a cached pre-patch layer (24.22.0) and skip the
# redeploy. CVE-2026-111497 is a Brotli decoder RCE; the release also
# includes CVE-2026-105482, CVE-2026-105483, CVE-2026-106069,
# CVE-2026-105481, CVE-2026-106072, CVE-2026-106074, and CVE-2026-106073.
FROM node:24.22.1-alpine AS base

# This tag already includes libssl3/libcrypto3 3.5.9-r0 and zlib 1.3.2-r1
# (zlib CVE-2026-85091, gzprintf only). Refresh them at build time so a
# later Alpine patch is picked up without waiting for a new Node tag.
# The image still ships npm 11.19.1. npm 11.21.1 is the patched npm 11 line
# (brace-expansion, postcss-selector-parser, http-cache-semantics) but still
# ships ip-address 10.7.2 (GHSA-rxp7-6hxx-x8q5 / CVE-2026-111997, <=10.7.3,
# fixed in 10.7.4) and undici 6.29.0 (GHSA-xjj6-f33q-929c / CVE-2026-109869
# and GHSA-4qv8-2p9j-2685 / CVE-2026-109924, fixed in 6.29.1). socks and
# @npmcli/agent accept ip-address ^10.1.x; node-gyp accepts undici ^6.25.0.
# These copies are npm CLI tooling, not on the request path. Node's own
# undici is already 7.30.1 (process.versions.undici).
RUN apk add --no-cache --upgrade libcrypto3 libssl3 zlib \
 && npm install -g npm@11.21.1 \
 && npm pack ip-address@10.7.4 undici@6.29.1 --pack-destination /tmp \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/ip-address \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/ip-address \
 && tar -xzf /tmp/ip-address-10.7.4.tgz -C /usr/local/lib/node_modules/npm/node_modules/ip-address --strip-components=1 \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/undici \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/undici \
 && tar -xzf /tmp/undici-6.29.1.tgz -C /usr/local/lib/node_modules/npm/node_modules/undici --strip-components=1 \
 && rm -f /tmp/ip-address-10.7.4.tgz /tmp/undici-6.29.1.tgz \
 && node -e "const ip=require('/usr/local/lib/node_modules/npm/node_modules/ip-address/package.json').version; const u=require('/usr/local/lib/node_modules/npm/node_modules/undici'); const uv=require('/usr/local/lib/node_modules/npm/node_modules/undici/package.json').version; if (ip!=='10.7.4' || uv!=='6.29.1' || !u.fetch) { console.error('unexpected', ip, uv); process.exit(1); }" \
 && npm cache clean --force

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]