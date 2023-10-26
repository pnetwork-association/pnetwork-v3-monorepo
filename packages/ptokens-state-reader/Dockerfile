ARG VERSION_PTOKENS_BASE=latest
ARG VERSION_IPFS_KUBO=v0.22.0
ARG REGISTRY=ghcr.io/pnetwork-association

FROM ipfs/kubo:${VERSION_IPFS_KUBO} AS ipfs_image
FROM $REGISTRY/ptokens-base-stage:$VERSION_PTOKENS_BASE

ENV FOLDER_IPFS=/home/node/.ipfs

WORKDIR $FOLDER_APP

COPY --from=ipfs_image /usr/local/bin/ipfs /usr/local/bin/

COPY package.json .

RUN npm install ../ptokens-constants ../ptokens-utils && \
    echo '{}' > $FOLDER_APP/config.json && \
    mkdir -p ${FOLDER_IPFS} && \
    chown -R node:node $FOLDER_APP $FOLDER_IPFS

COPY --chown=node:node lib $FOLDER_APP/lib
COPY --chown=node:node index.js $FOLDER_APP/

USER node

VOLUME $FOLDER_LOGS

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./index.js"]
