ARG VERSION_PTOKENS_BASE=latest
ARG REGISTRY=ghcr.io/pnetwork-association

FROM $REGISTRY/ptokens-base-stage:$VERSION_PTOKENS_BASE

WORKDIR $FOLDER_APP

COPY package.json .

RUN npm install ../ptokens-constants ../ptokens-utils && \
    echo '{}' > $FOLDER_APP/config.json

COPY --chown=node:node lib $FOLDER_APP/lib
COPY --chown=node:node index.js $FOLDER_APP/

USER node

VOLUME $FOLDER_LOGS

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./index.js"]
