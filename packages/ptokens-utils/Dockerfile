# This is only meant to be holding a folder
# for copying in other images

ARG VERSION_PTOKENS_CONSTANTS=latest
ARG REGISTRY=ghcr.io/pnetwork-association

FROM $REGISTRY/ptokens-constants:$VERSION_PTOKENS_CONSTANTS as ptokens-constants
FROM node:16.17.0-bullseye-slim

ENV HOME=/home/node
ENV SRC=$HOME/ptokens-utils

COPY --chown=node:node --from=ptokens-constants \
  /home/node/ptokens-constants \
  $HOME/ptokens-constants

WORKDIR $SRC

COPY --chown=node:node package.json .

RUN npm install --omit=dev ../ptokens-constants

COPY --chown=node:node . .

USER node

CMD ["node"]
