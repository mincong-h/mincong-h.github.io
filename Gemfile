source "https://rubygems.org"

# gem "github-pages", group: :jekyll_plugins
gemspec

# Pin logger < 1.6.0: Ruby 3.3.5 ships logger 1.6.0, whose Logger#level reads
# @level_override, but Jekyll 4.3.1's Stevenson subclass overrides #initialize
# without calling super, leaving @level_override nil and crashing `jekyll serve`.
gem "logger", "~> 1.5.3"
