# TODO Factor out this stage into it's own package (ptokens-docker-stages)
# this means we need logic on Nx to perform the build of the stage locally
# and then build this Dockerfile
# https://docs.docker.com/build/building/multi-stage/#use-an-external-image-as-a-stage
FROM debian:bullseye-slim AS debian-stage

RUN apt-get update && \
    apt-get install -y \
        dumb-init=1.2.5-1

ARG VERSION_PTOKEN_UTILS

FROM ghcr.io/pnetwork-association/ptokens-utils:${VERSION_PTOKEN_UTILS:-latest} AS ptokens-utils-stage
FROM ghcr.io/pnetwork-association/ptokens-schemas:${VERSION_PTOKEN_UTILS:-latest} AS ptokens-schemas-stage
FROM node:16.17.0-bullseye-slim

ENV NODE_ENV production
ENV FOLDER_SRC /usr/src
ENV FOLDER_APP $FOLDER_SRC/processor
ENV FOLDER_LOGS $FOLDER_APP/logs

RUN mkdir -p $FOLDER_APP && \
    mkdir -p $FOLDER_LOGS

COPY --from=debian-stage \
    /usr/bin/dumb-init \
    /usr/bin/dumb-init

WORKDIR $FOLDER_APP

COPY --from=ptokens-utils-stage \
     --chown=node:node \
        /home/node/ptokens-utils \
        $FOLDER_SRC/ptokens-utils

COPY --from=ptokens-schemas-stage \
     --chown=node:node \
        /home/node/ptokens-schemas \
        $FOLDER_SRC/ptokens-schemas

COPY package.json .

RUN npm install ../ptokens-schemas && \
    npm install ../ptokens-utils && \
    npm install && \
    chown -R node:node $FOLDER_APP

COPY --chown=node:node lib $FOLDER_APP/lib
COPY --chown=node:node index.js $FOLDER_APP/

USER node

VOLUME $FOLDER_LOGS

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./index.js"]