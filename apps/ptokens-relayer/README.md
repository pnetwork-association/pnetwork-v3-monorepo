## pNetwork v3 Relayer

### .env

```env
# Store only global docker compose configurables
# here, such as environment variables
#
# Components configuration is handled by means of
# config.json files
#

# Set them to a user that does not have root access
GLOBAL_UID=1001
GLOBAL_GID=1001

COMPOSE_FILE=./dev/docker-compose.relayer.dev.yml
COMPOSE_PROJECT_NAME=ptokens-relayer

APP_CONFIG_JSON=/usr/src/app/config.json
APP_FOLDER_LOGS=/usr/src/app/logs
PRIVATE_KEY_FILE=/usr/src/app/private-key

VERSION_EVM_LISTENER=latest
VERSION_EVM_PROCESSOR=latest
IMAGE_EVM_LISTENER=ghcr.io/pnetwork-association/ptokens-listener
IMAGE_EVM_PROCESSOR=ghcr.io/pnetwork-association/ptokens-request-processor
```

### Deploy

Change the docker

```bash
nx run-many --target=docker-build
docker compose up listener
```

**Note:** if you see the following error

```bash
Error: EACCES: permission denied, open 'logs/listener-0x60ef5904.log'
```

Means the logs folder has not the correct access right permission.
You should set them to the `GLOBAL_UID` and `GLOBAL_GID` values like follows

```bash
sudo chown -R 1001:1001 logs
```

### Spin up a relayer with the `dev` Dockerfile

Set the variable `COMPOSE_FILE` in the `.env`

```env
COMPOSE_FILE=docker-compose.yml:./dev/docker-compose.relayer.yml
```

Then

```bash
docker compose up
```
