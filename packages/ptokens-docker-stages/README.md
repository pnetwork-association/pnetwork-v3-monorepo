## pTokens Docker stages

This project is aimed to group all the Docker stages needed for the all monorepo projects.

### Build

To build all the images just run

```bash
./build.sh
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
