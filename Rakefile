require 'sinatra/asset_pipeline/task'
require './app'

Sinatra::AssetPipeline::Task.define! PersonalWebsite


desc 'Generates the sitemap'
task :generate_sitemap do
  map = XmlSitemap::Map.new('www.bryanmikaelian.com') do |m|
    m.add '/'
  end
  map.render_to('public/sitemap.xml')

end
