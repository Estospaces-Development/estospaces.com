FROM node:26.8-bookworm-slim@sha256:cd9f682fa2885cd1056e830424764158570061c59736a1da836bc3d73df095ae AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_APP_BASE_URL=https://app.estospaces.com
ARG NEXT_PUBLIC_LANDING_API_BASE_URL=
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ENV NEXT_PUBLIC_APP_BASE_URL=$NEXT_PUBLIC_APP_BASE_URL
ENV NEXT_PUBLIC_LANDING_API_BASE_URL=$NEXT_PUBLIC_LANDING_API_BASE_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
RUN npm run build

FROM node:26.8-bookworm-slim@sha256:cd9f682fa2885cd1056e830424764158570061c59736a1da836bc3d73df095ae AS runtime

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
