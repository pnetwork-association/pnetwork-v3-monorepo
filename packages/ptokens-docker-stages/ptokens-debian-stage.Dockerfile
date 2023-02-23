FROM debian:bullseye-slim

LABEL version=1.0

RUN apt-get update && \
    apt-get install -y \
        dumb-init=1.2.5-1

WORKDIR /home
