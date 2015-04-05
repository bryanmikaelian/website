require 'sinatra/base'

class PersonalWebsite < Sinatra::Application
  register Sinatra::AssetPipeline

  configure do
    set :haml, layout_options: {views: 'views/layouts'}
  end

  get '/' do
    haml :index, layout: :application
  end

end
