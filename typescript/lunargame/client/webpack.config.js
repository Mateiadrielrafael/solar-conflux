const { resolve } = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin")
const webpackMerge = require("webpack-merge")

const isProduction = process.env.NODE_ENV === "production"

const projectRoot = resolve(__dirname)
const sourceFolder = resolve(projectRoot, "src")
const buildFolder = resolve(projectRoot, "dist")
const htmlTemplateFile = resolve(sourceFolder, "index.html")

const babelRule = {
  test: /\.(js|tsx?)$/,
  use: "babel-loader",
}

const sassRule = {
  test: /\.scss$/,
  use: [
    isProduction
      ? MiniCssExtractPlugin.loader
      : {
          loader: "style-loader",
          options: {
            singleton: true,
          },
        },
    { loader: "css-loader" },
    {
      loader: "sass-loader",
      options: {
        includePaths: [sourceFolder],
      },
    },
  ],
}

const baseConfig = {
  mode: "none",
  entry: [ resolve(sourceFolder, "main")],
  output: {
    filename: "js/[name].js",
    path: buildFolder,
    publicPath: "/",
  },
  module: {
    rules: [ babelRule, sassRule],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".scss"],
  },
  plugins: [
  ]
}

const devConfig = {
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: htmlTemplateFile,
      chunksSortMode: "dependency",
    }),
  ],
  devtool: "inline-source-map",
  devServer: {
    historyApiFallback: true
  }
}

const prodConfig = {
  mode: "production",
  optimization: {
    minimize: true,
    nodeEnv: "production",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].min.css",
    }),
    new OptimizeCssAssetsWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: htmlTemplateFile,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      inject: true
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],
  devtool: "source-map"
}

function getFinalConfig() {
  if (process.env.NODE_ENV === "production") {
    console.info("Running production config")
    return webpackMerge(baseConfig, prodConfig)
  }

  console.info("Running development config")
  return webpackMerge(baseConfig, devConfig)
}

module.exports = getFinalConfig()
