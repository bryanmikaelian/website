Bundler.require
require 'sinatra/base'
require 'sinatra/asset_pipeline'

class PersonalWebsite < Sinatra::Application
  set :assets_precompile, %w(application.js application.css *.png *.jpg *.svg *.eot *.ttf *.woff)
  set :assets_prefix, %w(app/assets)
  set :assets_css_compressor, :sass
  set :assets_js_compressor, :uglifier

  register Sinatra::AssetPipeline

  set :views, Proc.new { File.join(root, "app/views") }
  set :haml, layout_options: {views: 'app/views/layouts'}

  if defined?(RailsAssets)
    RailsAssets.load_paths.each do |path|
      settings.sprockets.append_path(path)
    end
  end

  get '/' do
    haml :index, layout: :application
  end

end
