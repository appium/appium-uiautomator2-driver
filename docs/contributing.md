---
hide:
  - navigation
  - toc

title: Contributing
---

Contributions to this project are welcome! To start off, clone it from GitHub and run:

```bash
npm install
```

To build the project:

```bash
npm run build
```

To run in development mode:

```bash
npm run dev
```

To run tests for the driver part of the project:

```bash
npm run test     # unit 
npm run e2e-test # functional
```

There are also a number of environment variables that can be used when running the tests locally.
These include:

* `APPIUM_TEST_SERVER_HOST` - set the host URL (default `127.0.0.1`)
* `APPIUM_TEST_SERVER_PORT` - set the host port (default `4567`)
* `APPIUM_LOG_PATH` - set the path to Appium logs

To lint and format:

```bash
npm run lint:fix
npm run format
```

To develop documentation:

```bash
npm run install-docs-deps # install the dependencies (Python packages)
npm run dev:docs          # serve the docs locally and watch for changes
```

Additional scripts can also be found in `package.json`.
