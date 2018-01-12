const path = require('path');

const config = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
  },

  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    }
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [ 'style-loader', 'css-loader' ]
      },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { 
        test: /\.md$/,
        use: [
          'html-loader', 'markdown-loader'
        ]

      },
      {
        test: /\.png$/,  
        use: [{
          loader: 'url-loader',
          options: { 
            name: 'images/[name].[ext]'
          } 
        }]
      }
    ]
  }
}

module.exports = config;
