# Git Brain

## checkout a branch

`git checkout branchname`

## force git to forget about a file

`git rm --cached .gitbook/assets/Jenkins.png`

## to restore a file to what it was before current working changes
`git restore file`

## to abort a rebase operation
`git rebase --abort`

## setup SCP in an action

* create ssh keypair on the server as a specific user used just for uploading
* copy the private key to a github secret
* append the public key to the `.ssh/authorized_keys` file
* make a github action that uploads the artifacts using [this scp action](https://github.com/appleboy/scp-action?tab=readme-ov-file)

action looks like
```yaml

name: Publish Brain

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-brain
      - name: copy file with ssh password
        uses: appleboy/scp-action@v0.1.7
        with:
          host: myserver.com
          username: deployuser
          port: 22
          key: ${{secrets.DEPLOYUSER_PRIVATE_KEY}}
          source: "*.html"
          target: remote_path
```
