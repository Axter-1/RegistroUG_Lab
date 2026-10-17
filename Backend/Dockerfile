FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN chown -R node:node /app

USER node

EXPOSE 3000
CMD ["pnpm", "run", "dev"]