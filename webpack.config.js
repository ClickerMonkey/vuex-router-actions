const path = require('path')

module.exports =
{
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  output: {
    filename: 'vuex-router-actions.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'VuexRouterActions',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
}
