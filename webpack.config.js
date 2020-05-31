const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isProductionBuild = argv.mode === "production";
  const publicPath = '/';

  const pcss = {//loader для pcss
    test: /\.(p|post|)css$/,//регулярное выражение для проверки пути
    use: [
      isProductionBuild ? MiniCssExtractPlugin.loader : "vue-style-loader",//если build вставка css напрямую в тег style
      "css-loader",//перевод в строку
      "postcss-loader"//загрузка pcss
    ]
  };

  const vue = {
    test: /\.vue$/,
    loader: "vue-loader"//loader для vue
  };

  const js = {//loader для js
    test: /\.js$/,
    loader: "babel-loader",//прогоняется через babel
    exclude: /node_modules/,
    options: {
      presets: ['@babel/preset-env'],
      plugins: ["@babel/plugin-syntax-dynamic-import"]
    }
  };

  const files = {
    test: /\.(png|jpe?g|gif|woff2?)$/i,
    loader: "file-loader",//loader для файлов
    options: {
      name: "[hash].[ext]"
    }
  };

  const svg = {//loader для svg
    test: /\.svg$/,
    use: [
      {
        loader: "svg-sprite-loader",//сборка svg в спрайт
        options: {
          extract: true,
          spriteFilename: svgPath => `sprite${svgPath.substr(-4)}`
        }
      },
      "svg-transform-loader",
      {
        loader: "svgo-loader",//сжатие svg файлов
        options: {
          plugins: [
            { removeTitle: true },
            {
              removeAttrs: {
                attrs: "(fill|stroke)"
              }
            }
          ]
        }
      }
    ]
  };

  const pug = {
    test: /\.pug$/,
    oneOf: [
      {
        resourceQuery: /^\?vue/,
        use: ["pug-plain-loader"]//pug loader для vue
      },
      {
        use: ["pug-loader"]//loader для pug
      }
    ]
  };

  const config = {//конфигурация сборки
    entry: {//точка входа
      main: "./src/main.js",
      admin: "./src/admin/main.js"//отслеживаемые файлы
    },
    output: {//то что будет на выходе
      path: path.resolve(__dirname, "./dist"),//абсолютный путь к папке куда будут положены готовые файлы
      filename: "[name].[hash].build.js",//имя и хэш файла
      publicPath: isProductionBuild ? publicPath : "",
      chunkFilename: "[chunkhash].js"//общие зависимости
    },
    module: {//модули
      rules: [pcss, vue, js, files, svg, pug]//правила обработки зависимостей
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        images: path.resolve(__dirname, "src/images")//чтобы не указывать пути каждый раз
      },
      extensions: ["*", ".js", ".vue", ".json"]//какие расширения искать внутри папки
    },
    devServer: {
      historyApiFallback: true,//все ненайденные маршруты ведут на index.html
      noInfo: false,
      overlay: true//отображение ошибки на странице
    },
    performance: {
      hints: false//подсказки и уведомления webpack
    },
    plugins: [//плагины
      new HtmlWebpackPlugin({//генерирует html со всеми зависимостями
        template: "src/index.pug",
        chunks: ["main"]
      }),
      new HtmlWebpackPlugin({
        template: "src/admin/index.pug",
        filename: "admin/index.html",
        chunks: ["admin"]
      }),
      new SpriteLoaderPlugin({ plainSprite: true }),//создает отдельный файл со спрайтом
      new VueLoaderPlugin()//необходим для vue loader
    ],
    devtool: "#eval-source-map"//генерирует соурсмапы
  };

  if (isProductionBuild) {//при продакшене
    config.devtool = "none";
    config.plugins = (config.plugins || []).concat([//убираем все соурсмапы
      new webpack.DefinePlugin({//передает внутрь библиотек и зависимостей переменную NODE_ENV
        "process.env": {
          NODE_ENV: '"production"'
        }
      }),
      new MiniCssExtractPlugin({//выносит стили в отдельные css файлы
        filename: "[name].[contenthash].css",
        chunkFilename: "[contenthash].css"
      })
    ]);

    config.optimization = {};

    config.optimization.minimizer = [
      new TerserPlugin({//сжимает js код
        cache: true,
        parallel: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({})//сжимает css код
    ];
  }

  return config;
};
