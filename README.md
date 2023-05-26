# pNetwork v3 Monorepo

pNetwork v3 is the new architecture of pNetwork, that makes the protocol fully decentralized!

## Overview

pNetwork v3, in a nutshell, offers:

- An optimistic approach secured by fraud proofs
- Security provided by different actors (multi-provers): Sentinels, Guardians, and the DAO
- Free extensibility, without closed gates

This repository contains a monorepo organized in `packages` and `apps`.

The `packages` directory contains containerized projects which are used by the deployed apps. Each project in this directory comes with its own README file providing instructions for running the component and an overview of its architecture. The `apps` directory contains docker-compose configurations required by the pNetwork v3 player to operate as a Guardian or a Relayer.

The project is currently under active development and is subject to frequent changes. We encourage contributions and feedback from the open-source community.

## Getting Started

To spin up a project:

1. Navigate to the appropriate directory in the `apps` or `packages` folder.
2. Refer to the README file in that directory for instructions on how to run the component and information about its architecture.
3. Generally, you can run the docker-compose command to launch an application from the `apps` folder.

## Contributing

We welcome contributions from the open-source community. Please read our [contributing guide](CONTRIBUTING.md) for more information.

## License

This project is licensed under the [MIT License](LICENSE).

## Disclaimer

Please note that the project is under active development, and the structure and implementation are subject to change.

## Contact

For any questions, feedback, or discussions, please open an issue on this repository or reach out to us at [our contact email](mailto:admin@p.network).
