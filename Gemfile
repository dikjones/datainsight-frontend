source :rubygems
source 'https://gems.gemfury.com/vo6ZrmjBQu5szyywDszE/'

group :router do
  gem 'router-client', '3.1.0', :require => 'router'
end

gem "rake", "0.9.2"
gem "sinatra", "1.3.2", :require => "sinatra/base"
gem "padrino-helpers", '~> 0.10'
gem "sprockets", '~> 2.0'
gem 'slimmer', '1.2.4'
gem "rack", "1.4.1"
gem "activesupport", "3.2.8"
gem "json"
gem "unicorn"
gem 'sinatra-content-for', '0.1'
gem 'nokogiri'
gem "songkick-transport", :git => "git://github.com/songkick/transport.git"
gem "httparty"
gem "whenever"
gem "datainsight_logging"
gem "airbrake", '3.1.5'

group :compressors do
  gem "yui-compressor", :require => false
  gem "uglifier", :require => false
end

group :test do
  #gem "rack-test"
  gem "rspec", "2.10.0"
  gem "ci_reporter"

  gem "jasmine", "1.2.0"
  gem "jasmine-phantom", "0.0.6"

  gem "capybara", "~> 1.1.2"
  gem "eventmachine", "1.0.0.rc.4" # Ubuntu precise bugfix, needed for poltergeist, see: https://github.com/eventmachine/eventmachine/commit/9473a1b181ed1997e3156d960b2bb2783f508191
  gem "poltergeist"
end

