ARG VERSION_PTOKENS_UTILS=latest
ARG VERSION_PTOKENS_SCHEMAS=latest
ARG VERSION_PTOKENS_DEBIAN_STAGE=latest

ARG REGISTRY=ghcr.io/pnetwork-association

FROM $REGISTRY/ptokens-utils:$VERSION_PTOKENS_UTILS as ptokens-utils
FROM $REGISTRY/ptokens-debian-stage:$VERSION_PTOKENS_DEBIAN_STAGE as ptokens-debian-stage
FROM node:16.17.0-bullseye-slim

LABEL tag=ptokens-base-stage
LABEL description="Base image for the pTokens apps"
LABEL version=1.0

ENV NODE_ENV production
ENV FOLDER_SRC /usr/src
ENV FOLDER_APP $FOLDER_SRC/app
ENV FOLDER_LOGS $FOLDER_APP/logs

RUN mkdir -p $FOLDER_APP && \
    mkdir -p $FOLDER_LOGS && \
    usermod -u 1000 node && \
    groupmod -g 1000 node

COPY --from=ptokens-debian-stage \
    /usr/bin/dumb-init \
    /usr/bin/dumb-init

COPY --from=ptokens-utils \
     --chown=node:node \
        /home/node/ptokens-utils \
        $FOLDER_SRC/ptokens-utils

COPY --from=ptokens-utils \
     --chown=node:node \
        /home/node/ptokens-constants \
        $FOLDER_SRC/ptokens-constants