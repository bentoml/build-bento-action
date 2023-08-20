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
        id: bento
      - run: |
        echo "Bento tag: ${{ steps.bento.outputs.bento-tag }}"
        echo "Bento name: ${{ steps.bento.outputs.bento-name }}"
        echo "Bento version: ${{ steps.bento.outputs.bento-version }}"
        echo "Bento metadata: ${{ steps.bento.outputs.bento-metadata }}"
```

> [!NOTE]
> By default, this action will use the default GitHub context as the build context for `bentoml build`
> command. To use a different context, set `context`
> ```yaml
> - uses: bentoml/build-bento-action@v1
>   with:
>     context: 'path/to/context'
> ```

To specify a version, use `version` input:

```yaml
- uses: bentoml/build-bento-action@v1
  with:
    version: '1.0.0'
```

To specify different bentofile, use `bentofile` input:

```yaml
- uses: bentoml/build-bento-action@v1
  with:
    bentofile: 'path/to/bentofile'
```

> [!IMPORTANT]
> `bentofile` must be a path relative to the `context` directory.
