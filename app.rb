require 'sinatra/base'
require 'sinatra/asset_pipeline'

class PersonalWebsite < Sinatra::Application

  configure do
    set :haml, layout_options: {views: 'views/layouts'}
    set :assets_precompile, %w(application.js application.css *.png *.jpg)
    set :assets_prefix, %w(assets vendor/assets)
    set :assets_css_compressor, :sass
    set :assets_js_compressor, :uglifier
  end

  register Sinatra::AssetPipeline

  get '/' do
    haml :index, layout: :application
  end

end
