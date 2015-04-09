source 'http://rubygems.org'
ruby '2.2.1'

gem 'sinatra', '1.4.6', require: 'sinatra/base'
gem 'sinatra-asset-pipeline', require: 'sinatra/asset_pipeline'

gem 'sprockets', '~> 2.0'
gem 'haml'
gem 'uglifier'
gem 'sass'
gem 'xml-sitemap'


group :development do
  gem 'heroku', '3.30.6'
  gem 'shotgun'
end

group :production do
  gem 'thin'
end

source 'https://rails-assets.org' do
  gem 'rails-assets-skeleton'
end
