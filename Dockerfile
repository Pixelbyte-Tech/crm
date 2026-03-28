# The build arguments
ARG NODE_VERSION=22.18.0
ARG TARGET_APP

################################################
# Base stage
################################################
FROM node:${NODE_VERSION}-alpine AS base
ARG TARGET_APP

# Set working directory
WORKDIR /app

# Specify PNPM home location
ENV PNPM_HOME="/pnpm"

# Add PNPM to PATH
ENV PATH="$PNPM_HOME:$PATH"

# Disable corepack integrity keys until this is solved: https://github.com/nodejs/corepack/issues/612
RUN npm i -g corepack@latest

# Enable corepack which contains PNPM
RUN corepack enable pnpm

# Install NestJS CLI
RUN pnpm add --global @nestjs/cli

# Copy the remaining required files
COPY apps/${TARGET_APP} apps/${TARGET_APP}
COPY packages packages

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY turbo.json turbo.json


################################################
# Prune stage
################################################
FROM base AS pruner
ARG TARGET_APP

# Set working directory
WORKDIR /app

COPY apps/${TARGET_APP} apps/${TARGET_APP}
COPY packages packages
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY turbo.json turbo.json

RUN pnpm dlx turbo prune @crm/$TARGET_APP --docker


################################################
# Installer stage
################################################
FROM base AS installer
ARG TARGET_APP

# Set working directory
WORKDIR /app

# Copy package.json's and pnpm-lock.json of the app being built.
COPY --from=pruner /app/out/json .

# Install dependencies and mount cache them by ID
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Copy the rest of the full app, sourcecode, etc.
COPY --from=pruner /app/out/full .


################################################
# Build (NodeJS)
################################################
FROM base AS build
ARG TARGET_APP

# Set working directory
WORKDIR /app

COPY --from=installer /app .

# Build only the filtered target app in the pruned workspace
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run build


################################################
# Development stage
################################################
FROM base AS development

# Set working directory
WORKDIR /app

# Copy the maxmind database for geoip lookups
COPY packages/geo/files/maxmind /usr/local/maxmind

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install


################################################
# Pre-production (NodeJS)
################################################
FROM build AS pre-production
ARG TARGET_APP

# Deploy the app to the /pruned-app folder
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter=@crm/$TARGET_APP --prod deploy --legacy /app/pruned


################################################
# Production (NodeJS)
################################################
FROM node:${NODE_VERSION}-alpine AS production
ARG TARGET_APP

# Set working directory
WORKDIR /app

# Add open ssl and curl
RUN apk add --no-cache openssl curl

# Copy built output from build stage
COPY --from=pre-production /app/pruned .

# Copy the maxmind database for geoip lookups
COPY packages/geo/files/maxmind /usr/local/maxmind

# Expose the right port
EXPOSE 3000

CMD node /app/dist/main.js


################################################
# Production (Next)
################################################
FROM node:${NODE_VERSION}-alpine AS production-next
ARG TARGET_APP

# Set working directory
WORKDIR /app

# Add open ssl and curl
RUN apk add --no-cache openssl curl

# Copy built output from build stage
COPY --from=build /app/apps/${TARGET_APP}/.next ./.next
COPY --from=pre-production /app/pruned .

# Expose the right port
EXPOSE 3000

CMD npm run start


################################################
# Production (Migrations)
################################################
FROM node:${NODE_VERSION}-alpine AS migrations

# Set working directory
WORKDIR /app

# Specify PNPM home location
ENV PNPM_HOME="/pnpm"

# Add PNPM to PATH
ENV PATH="$PNPM_HOME:$PATH"

# Disable corepack integrity keys until this is solved: https://github.com/nodejs/corepack/issues/612
RUN npm i -g corepack@latest

# Enable corepack which contains PNPM
RUN corepack enable pnpm

# Copy the remaining required files
COPY packages packages

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY turbo.json turbo.json

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm build

CMD pnpm db:migrate:up