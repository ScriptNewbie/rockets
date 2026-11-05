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
# ships vulnerable copies. These are npm CLI tooling, not on the request
# path. Node's own undici is already 7.30.1 (process.versions.undici).
# Overlay the smallest published fixes inside the ranges the callers accept,
# except glob/minimatch where the only fix is the next major:
# - ip-address 10.7.2 -> 10.7.4 (GHSA-rxp7-6hxx-x8q5 / CVE-2026-111997;
#   socks and @npmcli/agent accept ^10.1.x)
# - undici 6.29.0 -> 6.29.1 (GHSA-xjj6-f33q-929c / CVE-2026-109869 and
#   GHSA-4qv8-2p9j-2685 / CVE-2026-109924; node-gyp accepts ^6.25.0)
# - glob 13.0.6 -> 14.0.2 (GHSA-3g3m-2fjr-6pw4 / CVE-2026-118773). glob 14
#   needs path-scurry ^3, so the hoisted path-scurry 2.0.2 moves to 3.0.0.
# - minimatch 10.2.5 -> 11.0.1 (GHSA-g3hv-75wg-m249 / CVE-2026-118764).
#   minimatch 11 needs @isaacs/nonrecursive-glob-match, pinned to 1.0.1.
#   npm itself declares minimatch ^10.2.5 and glob ^13.0.6; the overlay is
#   outside those ranges. Call sites use the named glob() / minimatch()
#   exports and Minimatch options that 11 still accepts.
RUN apk add --no-cache --upgrade libcrypto3 libssl3 zlib \
 && npm install -g npm@11.21.1 \
 && npm pack ip-address@10.7.4 undici@6.29.1 glob@14.0.2 minimatch@11.0.1 path-scurry@3.0.0 @isaacs/nonrecursive-glob-match@1.0.1 --pack-destination /tmp \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/ip-address \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/ip-address \
 && tar -xzf /tmp/ip-address-10.7.4.tgz -C /usr/local/lib/node_modules/npm/node_modules/ip-address --strip-components=1 \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/undici \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/undici \
 && tar -xzf /tmp/undici-6.29.1.tgz -C /usr/local/lib/node_modules/npm/node_modules/undici --strip-components=1 \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/glob \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/glob \
 && tar -xzf /tmp/glob-14.0.2.tgz -C /usr/local/lib/node_modules/npm/node_modules/glob --strip-components=1 \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/minimatch \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/minimatch \
 && tar -xzf /tmp/minimatch-11.0.1.tgz -C /usr/local/lib/node_modules/npm/node_modules/minimatch --strip-components=1 \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/path-scurry \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/path-scurry \
 && tar -xzf /tmp/path-scurry-3.0.0.tgz -C /usr/local/lib/node_modules/npm/node_modules/path-scurry --strip-components=1 \
 && rm -rf /usr/local/lib/node_modules/npm/node_modules/@isaacs/nonrecursive-glob-match \
 && mkdir -p /usr/local/lib/node_modules/npm/node_modules/@isaacs/nonrecursive-glob-match \
 && tar -xzf /tmp/isaacs-nonrecursive-glob-match-1.0.1.tgz -C /usr/local/lib/node_modules/npm/node_modules/@isaacs/nonrecursive-glob-match --strip-components=1 \
 && rm -f /tmp/ip-address-10.7.4.tgz /tmp/undici-6.29.1.tgz /tmp/glob-14.0.2.tgz /tmp/minimatch-11.0.1.tgz /tmp/path-scurry-3.0.0.tgz /tmp/isaacs-nonrecursive-glob-match-1.0.1.tgz \
 && node -e "const root='/usr/local/lib/node_modules/npm/node_modules'; const ver=p=>require(root+'/'+p+'/package.json').version; const ip=ver('ip-address'); const uv=ver('undici'); const gv=ver('glob'); const mv=ver('minimatch'); const pv=ver('path-scurry'); const nv=ver('@isaacs/nonrecursive-glob-match'); const u=require(root+'/undici'); const {globSync}=require(root+'/glob'); const {minimatch,Minimatch}=require(root+'/minimatch'); const mm=new Minimatch('*.json',{dot:true,matchBase:true,flipNegate:true,nocase:true}); const files=globSync(root+'/glob/package.json'); if (ip!=='10.7.4'||uv!=='6.29.1'||gv!=='14.0.2'||mv!=='11.0.1'||pv!=='3.0.0'||nv!=='1.0.1'||!u.fetch||typeof minimatch!=='function'||!mm.match('package.json')||files.length!==1) { console.error('unexpected', {ip,uv,gv,mv,pv,nv,files}); process.exit(1); }" \
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