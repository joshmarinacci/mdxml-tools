# Ruby brain

Don’t install ruby directly like this

``` shell
brew install ruby
```

then install bundle with

``` shell
sudo gem install bundler
```

Instead, you should install using RBenv with `brew install rbenv-bundler` then go to the root dir of your ruby codebase and do

``` shell
rbenv init
rbenv install 3.1.2 #install version 3.1.2 of Ruby
rbenv local 3.1.2 # set local to use this versoin
```

Then  we can install gems like bundle

``` shell
gem install bundle
```