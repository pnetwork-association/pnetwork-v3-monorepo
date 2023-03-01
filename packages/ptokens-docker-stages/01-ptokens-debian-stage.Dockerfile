FROM debian:bullseye-slim

LABEL version=1.0
LABEL tag=ptokens-debian-stage

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        dumb-init=1.2.5-1 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home
