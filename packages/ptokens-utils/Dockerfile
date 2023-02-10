FROM node:16-alpine

ENV HOME=/home/node
ENV SRC=$HOME/ptokens-utils

WORKDIR $SRC

COPY --chown=node:node package* ./

RUN npm install --only=production

COPY --chown=node:node lib ./lib
COPY --chown=node:node index.js .

USER node

CMD ["node"]

