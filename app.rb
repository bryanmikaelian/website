require 'sinatra/base'
require 'sinatra/assetpack'

class PersonalWebsite < Sinatra::Application
  set :root, File.dirname(__FILE__)
  register Sinatra::AssetPack

  assets do
    serve '/javascripts', from: 'app/assets/javascripts'
    js :application, [
      '/javascripts/*.js'
    ]

    serve '/stylesheets', from: 'app/assets/stylesheets'
    css :application, [
      '/stylesheets/*.css',
    ]

    serve '/images', from: 'app/assets/images'


    js_compression  :uglify
    css_compression :sass
  end

  configure do
    set :views, Proc.new { File.join(root, "app/views") }
    set :haml, layout_options: {views: 'app/views/layouts'}
  end

  get '/' do
    haml :index, layout: :application
  end

end
