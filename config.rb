require 'bootstrap-sass'
require 'compass-normalize'

http_path = "/"
css_dir = "public/css"
sass_dir = "assets/server/sass"
images_dir = "assets/server/images"
javascripts_dir = "public/js"
output_style = (environment == :production) ? :compressed : :expanded
relative_assets = true
preferred_syntax = :sass