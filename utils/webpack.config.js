module.exports = {
  mode: 'development',
  resolveLoader: {
    modules: ['utils', 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules(?!(\/@madkudu\/madkudu\.js))/,
        // exclude all node_modules, except @madkudu/madkudu.js (the exclusion is necessary for this to work inside another project)
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          env: {
            test: {
              plugins: ['istanbul']
            }
          }
        }
      },
      {
        test: /\.css$/,
        use: 'css-loader'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
        ]
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.pug$/,
        use: 'pug-loader'
      }
    ],
    noParse: [
      /jquery/,
      /next-tick/ // if we parse nextTick, webpack adds a bunch of polyfills (setImmediate) that modify the window object. not cool.
    ]
  },
  devtool: 'cheap-source-map',
  output: {
    library: 'madkudu',
    libraryTarget: 'umd'
  },
  plugins: []
}
