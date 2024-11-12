# Ruby brain

Don’t install ruby directly with

install
`brew install ruby`
then install bundle with
`sudo gem install bundler`



Instead using RBenv with `brew install rbenv-bundler`
then go to the root dir of your ruby codebase and do
```
rbenv init
rbenv install 3.1.2 #install version 3.1.2 of Ruby
rbenv local 3.1.2 # set local to use this versoin
```


Then  we can install gems like bundle

```
gem install bundle
```


