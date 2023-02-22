ARG VERSION_PTOKENS_UTILS=latest
ARG VERSION_PTOKENS_SCHEMAS=latest

ARG REGISTRY=ghcr.io/pnetwork-association

FROM $REGISTRY/ptokens-utils:$VERSION_PTOKENS_UTILS as ptokens-utils
FROM $REGISTRY/ptokens-schemas:$VERSION_PTOKENS_SCHEMAS as ptokens-schemas
FROM node:16.17.0-bullseye-slim

ENV NODE_ENV production
ENV FOLDER_SRC /usr/src
ENV FOLDER_APP $FOLDER_SRC/processor
ENV FOLDER_LOGS $FOLDER_APP/logs

RUN mkdir -p $FOLDER_APP && \
    mkdir -p $FOLDER_LOGS

COPY --from=ptokens-debian-stage:latest \
    /usr/bin/dumb-init \
    /usr/bin/dumb-init

COPY --from=ptokens-utils \
     --chown=node:node \
        /home/node/ptokens-utils \
        $FOLDER_SRC/ptokens-utils

COPY --from=ptokens-schemas \
     --chown=node:node \
        /home/node/ptokens-schemas \
        $FOLDER_SRC/ptokens-schemas

WORKDIR $FOLDER_APP

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