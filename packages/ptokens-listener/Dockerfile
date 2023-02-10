FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y \
        dumb-init=1.2.5-1

ARG VERSION_PTOKEN_UTILS

FROM ptokens-utils:${VERSION_PTOKEN_UTILS:-latest} AS ptokens_utils
FROM node:16.17.0-bullseye-slim

ENV NODE_ENV production
ENV FOLDER_SRC /usr/src
ENV FOLDER_APP $FOLDER_SRC/relayer
ENV FOLDER_LOGS $FOLDER_APP/logs

RUN mkdir -p $FOLDER_APP && \
    mkdir -p $FOLDER_LOGS

COPY --from=0 \
    /usr/bin/dumb-init \
    /usr/bin/dumb-init

WORKDIR $FOLDER_APP

COPY \
    --from=ptokens_utils \
    --chown=node:node \
        /home/node/ptokens-utils \
        $FOLDER_SRC/ptokens-utils

COPY package.json .

ENV REPLACE_DEPENDENCY 's/"ptokens-utils": "\*"/"ptokens-utils":"..\/ptokens-utils"/g'

RUN sed -i "$REPLACE_DEPENDENCY" package.json && \
    npm install --omit=dev && \
    chown -R node:node $FOLDER_APP

COPY --chown=node:node . $FOLDER_APP

USER node

VOLUME $FOLDER_LOGS

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./index.js"]
