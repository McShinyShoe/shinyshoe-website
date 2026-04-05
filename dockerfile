# syntax=docker/dockerfile:1

FROM rust:1.92.0-trixie AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    clang \
    curl \
    ca-certificates \
    npm \
    && rm -rf /var/lib/apt/lists/*

RUN cargo install cargo-leptos

RUN rustup target add wasm32-unknown-unknown

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY Cargo.toml Cargo.lock ./
COPY --exclude=docker/* . .

RUN cargo leptos build --release

FROM debian:trixie-slim AS runtime

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/server /app/server
COPY --from=builder /app/target/site /app/site

ENV LEPTOS_OUTPUT_NAME=shinyshoe-website
ENV LEPTOS_SITE_ROOT=site
ENV LEPTOS_SITE_PKG_DIR=pkg
ENV LEPTOS_RELOAD_PORT=3001

COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/app/server"]