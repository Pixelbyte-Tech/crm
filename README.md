# CRM Project Monorepo

This monorepo holds all BE and FE services for the CRM project.

## Getting started

Once you have customized the boilerplate for your project, follow these steps to get started:

Install node.js (version 22 or higher is recommended), if you haven't already: [https://nodejs.org/](https://nodejs.org/)

```bash
brew install nvm
nvm install 22
nvm use 22
```

Install [pnpm](https://pnpm.io/) globally, if you haven't already:

```bash
corepack enable pnpm
```

Install the project dependencies:

```bash
pnpm i
```

Build packages:

```bash
pnpm build
```

Apply environment variables:

```bash
cp ./apps/analytics/.env.example ./apps/analytics/.env
cp ./apps/audit/.env.example ./apps/audit/.env
cp ./apps/bull-monitor/.env.example ./apps/bull-monitor/.env
cp ./apps/crm/.env.example ./apps/crm/.env
cp ./apps/compliance/.env.example ./apps/compliance/.env
cp ./apps/notification/.env.example ./apps/notification/.env
cp ./apps/payment/.env.example ./apps/payment/.env
cp ./apps/prop/.env.example ./apps/prop/.env
cp ./apps/user/.env.example ./apps/user/.env
```

> Ensure to enable eslint and prettier on save in your IDE to maintain code quality and consistency across the codebase.

## Running the project

To run the project locally, you can use Docker Compose to start the necessary services.

```bash
docker compose up user
```

## Running the frontends

If you wish to run the frontend applications outside of docker, you can do so by updating your frontend `.env` files 
to point to the staging database and to any relevant staging microservices.

Once done, you can start the frontends as per the instructions in their respective README files.

```bash

## Setting up GitHub

Ensure the required GitHub secrets are added to your repository for CI/CD workflows to function correctly.
The necessary secrets include:

- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `RELEASE_PLEASE_GITHUB_TOKEN`