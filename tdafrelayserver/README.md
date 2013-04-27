# tdafrelayserver

## Documentation
### Project build
The project is managed using Grunt Task Runner.

For a list of available task, type
```bash
grunt --help
```

The following sections show the available options in detail.

### Development environment
Initialize your environment with git hooks

```bash
grunt init-dev-env
```

## Site generation
There is a grunt task to generate the GitHub pages of the project, publishing also coverage, complexity and JSDocs pages.
In order to initialize the GitHub pages, use:

```bash
grunt init-pages
```

This will also create a site folder under the root of your repository. This site folder is detached from your repository's
history, and associated to the gh-pages branch, created for publishing. This initialization action should be done only
once in the project history. Once the site has been initialized, publish with the following command:

```bash
grunt site
```

This command will only work after the developer has executed init-dev-env (that's the goal that will create the detached site).

This command will also launch the coverage, doc and complexity task (see in the following sections).


### Unit Test
Mocha + chai.

Both chai.expect and chai.should() are available globally while executing tests
For performing unit test, type
```bash
grunt test
```

### Code Coverage
Istanbul

Generates HTML coverage in `coverage/` directory
It generates a `coverage/cobertura-coverage.xml` file compatible with jenkins cobertura plugin
For analyzing the code coverage of your test, type
```bash
grunt coverage
```

### Source Code documentation
dox-foundation

Generates HTML documentation in `doc/` directory
For compiling source code documentation, type
```bash
grunt doc
```


### Coding guidelines

In order to check the source coding style use the following command:
```bash
grunt jshint
```

### Continuous testing
Support for continuous testing by modifying a src file or a test

For continuous testing, type
```bash
grunt watch
```

### Code complexity

Analizes code complexity using plato.
Stores code complexity report under report/ directory
For complexity report, type
```bash
grunt complexity
```

### PLC
Update the contributors for the project
```bash
grunt contributors
```
