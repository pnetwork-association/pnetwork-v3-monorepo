## pTokens Docker stages

This project is aimed to group all the Docker stages needed for the all monorepo projects.

### Build

To build all the images just run

```bash
./docker-build.sh
```

or

```bash
nx build
```

This will create two images:

- `<dockerfile-name>:latest`
- `<dockerfile-name>:<version>`

`<version>` is retrieved by the Dockerfile label, so be sure it's there
before running the build.

To make Nx build the stage before other dependant Dockerfiles, just add the
following property to the project's `package.json`:

```json
{
  "nx": {
    "implicitDependencies": ["ptokens-docker-stages"]
  }
}
```
