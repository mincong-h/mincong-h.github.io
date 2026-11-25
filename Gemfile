source "https://rubygems.org"

# gem "github-pages", group: :jekyll_plugins
gemspec

# Pin logger < 1.6.0: Ruby 3.3.5 ships logger 1.6.0, whose Logger#level reads
# @level_override, but Jekyll 4.3.1's Stevenson subclass overrides #initialize
# without calling super, leaving @level_override nil and crashing `jekyll serve`.
gem "logger", "~> 1.5.3"

# Pin minitest < 6: minitest 6 depends on prism, and the precompiled Linux gems of
# prism 2.x require Ruby >= 3.3. The CI runs Ruby 3.2 (.ruby-version), but Bundler
# 2.3.25 still picks the precompiled gem, so `bundle install` fails. Nothing in the
# build uses minitest: activesupport only needs it for its test helpers.
gem "minitest", "~> 5.27"
