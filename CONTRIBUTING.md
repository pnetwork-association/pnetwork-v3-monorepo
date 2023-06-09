# Developer reference

- [Basic tutorial](#basic-tutorial)
  - [Install `Nx`](#basic-install)
  - [Add a new project:](#basic-new-proj)
  - [Add a new local dependency](#basic-local-dep)
  - [Test all projects](#basic-test-all)
  - [Test a single project](#basic-test-sigle)
  - [Lint a single project](#basic-lint-single)
- [Best practices](#best-practices)
  - [Linting](#best-practices-linting)
  - [Commits](#best-practices-commits)
  - [Docker](#best-practices-docker)
  - [Development process](#best-practices-dev-process)
- [Development](#development)
  - [Build images](#dev-build-images)
  - [Troubleshooting](#dev-troubleshooting)

## <a name="basic-tutorial"></a> Basic tutorial

The monorepo has been created using the [Nx package-based model reference](https://nx.dev/tutorials/package-based-repo-tutorial).
What follows are a concise summary of the basic commands needed in order to create new features and should be seen as a reference.

### <a name="basic-install"></a> Install `Nx`

```bash
npm install -g nx
```

### <a name="basic-new-proj"></a> Add a new project:

To add/remove a project, just add/remove the folder to `packages/` and then, at the root:

```bash
npm install
```

### <a name="basic-local-dep"></a> Add a new local dependency

Add the dependency in the package's `package.json` file:

```
"dependencies": {
    "ptokens-utils": "*",
}
```

Then, at the project's root:

```bash
npm install
```

### <a name="basic-test-all"></a> Test all projects

```bash
nx run-many --target=test
```

### <a name="basic-test-sigle"></a> Test a single project

```bash
nx run ptokens-btc-syncer:test
```

### <a name="basic-lint-single"></a> Lint a single project

```bash
nx lint ptokens-utils
```

**Note:** Every script in the project should be run as a Nx task in
order to work properly, as module dependencies are installed in the
monorepo's root, not in the project anymore.

## <a name="best-practices"></a> Best practices

### <a name="best-practices-linting"></a> Linting

For JS source code, linting is governed by Google [`gts`](https://github.com/google/gts).
Just add the following JSON to a new project:

```json
{
  "extends": ["../../.eslintrc.json"]
}
```

If you need a new rule to add, please ask the team's opinion about it first in order to
select the best option for everyone.

### <a name="best-practices-commits"></a> Commits

Please follow the [`Convertional commit standard`](https://www.conventionalcommits.org/en/v1.0.0/)
when committing to any project in this repo, with this rule on top of that:

```
commit-type(<project-name>): <commit-text> [(<file|folder|context>)]
```

#### Examples

```
feat(ptokens-utils): add superpowers (fly.js)
refactor(ptokens-listener): rename this into that
```

**Note:** `[(<file|folder|context>)]` can be used when applicable,
on a set of files it's better omitting it.

### <a name="best-practices-dev-process"></a> Development process

Create a new branch having the pattern

```
<feat|chore|refactor|fix>/<component-name>/<branch-name>
```

#### Examples

- feat/ptokens-utils/add-superpowers
- chore/ptokens-listener/rename-file
- fix/ptokens-constants/wrong-type

### <a name="best-practices-docker"> Docker

[Snyk Cheatsheet](https://snyk.io/wp-content/uploads/NodeJS-CheatSheet.pdf)

## <a name="development"></a> Development

### <a name="dev-build-images"></a> Build Docker images

An image can be built in the following ways:

1. From the monorepo's root

```bash
nx run ptokens-utils:docker-build
```

2. From the project's root

```bash
nx docker-build
```

3. Or all the projects images together

```bash
nx run-many --target=docker-build
```

We avoid using Nx caching for the `docker-build` task since caching is already done by the Docker
build itself.

If you want to change this, you can add the `docker-build` task to `cacheableOperations` list in the
`nx.json` file.

## Docker best practices for Node apps

[Snyk Cheatsheet](https://snyk.io/wp-content/uploads/NodeJS-CheatSheet.pdf)

### <a name="dev-troubleshooting"></a> Troubleshooting

#### Tests can't find some modules/functions even if they have been installed correctly through `npm i` at the root's monorepo

**Solution:** Check that the project don't have the `node_modules` folder, if so delete it and the tests should
run again.
