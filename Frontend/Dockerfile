FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable \
    && corepack prepare pnpm@11.21.0 --activate \
    && pnpm install --frozen-lockfile

COPY . .

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
