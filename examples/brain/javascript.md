# Javascript, Node Brain

`create-react-app` with typescript and full tests and react.

``` shell
npx create-react-app my-app --template typescript
```

To make jest work right with create-react-app and typescript, add this to the `package.json` file:

``` json
"jest": {
  "transformIgnorePatterns": [
  ]
}
```

# clean NPM cache

When you have *just* released a new package version and `npm install` in another project says the package doesn’t exist, that could be because it tried to fetch the package before it was really live on npmjs.org. The problem is that it then remembers this forever. So you need to clear out the cache with

``` shell
npm cache clean --force
```

Run npm script in a different dir with

``` shell
npm --prefix <path> run <command>
```