# This is only meant to be holding a folder
# for copying in other images

FROM node:16.17.0-bullseye-slim

ENV HOME=/home/node
ENV SRC=$HOME/ptokens-schemas

WORKDIR $SRC

COPY --chown=node:node package.json .

RUN npm install --omit=dev

COPY --chown=node:node . .

USER node

CMD ["node"]
