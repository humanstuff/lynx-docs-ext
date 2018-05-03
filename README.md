# lynx-docs-ext
Extensions to @lynx-json/lynx-docs

# Extension example

`npm install @humanstuff/lynx-docs-ext` and add the following `.meta.yml` file to your lynx-docs project:
```yaml
realm: /meta/realms/
variants:
  - name: default
    jsmodule: @humanstuff/lynx-docs-ext
    function: serveRealmsIndex
```

After doing so, you will be able to request http://localhost:3000/meta/realms/ or http://localhost:3000/meta/realms/?refs to retrieve all realm/variant metadata from the lynx-docs application as JSON.
