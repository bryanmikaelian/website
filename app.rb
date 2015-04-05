require 'sinatra/base'

class PersonalWebsite < Sinatra::Application

  configure do
    set :haml, layout_options: {views: 'views/layouts'}
  end

  get '/' do
    haml :index, layout: :application
  end

end
