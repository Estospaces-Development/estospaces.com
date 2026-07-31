FROM node:22.22.2-bookworm-slim@sha256:9f6d5975c7dca860947d3915877f85607946403fc55349f39b4bc3688448bb6e AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_APP_BASE_URL=https://app.estospaces.com
ARG NEXT_PUBLIC_LANDING_API_BASE_URL=
ENV NEXT_PUBLIC_APP_BASE_URL=$NEXT_PUBLIC_APP_BASE_URL
ENV NEXT_PUBLIC_LANDING_API_BASE_URL=$NEXT_PUBLIC_LANDING_API_BASE_URL
RUN npm run build

FROM node:22.22.2-bookworm-slim@sha256:9f6d5975c7dca860947d3915877f85607946403fc55349f39b4bc3688448bb6e AS runtime

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 8080

CMD ["node", "server.js"]
