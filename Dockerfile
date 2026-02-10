# Astro (server mode) + Node standalone — for VPS deployment.
# Build: docker build -t senior-ledo .
# Run:   docker run -p 4321:4321 --env-file .env senior-ledo
# Or:    docker run -p 4321:4321 -e SMTP_HOST=... -e SMTP_USER=... ... senior-ledo

# Build stage
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Runtime stage
FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod --frozen-lockfile

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

# Pass env at runtime for SMTP etc. (do not bake secrets into image)
CMD ["node", "./dist/server/entry.mjs"]
