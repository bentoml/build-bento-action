## About

Build a Bento from a GitHub repository, or given context path.

## Usage

```yaml
name: ci
on:
  push:
    branches:
      - 'main'
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: bentoml/setup-bentoml-action@v1
        with:
          python-version: '3.10'
          bentoml-version: 'main'
      - uses: bentoml/build-bento-action@v1
```

> [!NOTE]
> By default, this action will use the default GitHub context as the build context for `bentoml build`
> command. To use a different context, set `context`
> ```yaml
> - uses: bentoml/build-bento-action@v1
>   with:
>     context: 'path/to/context'
> ```
