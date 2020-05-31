const fs = require("fs");

module.exports = {
  syntax: "postcss-scss",
  parser: 'postcss-scss',
  plugins: [
    require("postcss-easy-import")({//легкий импорт
      extensions: ".pcss"
    }),
    require("autoprefixer")({//автопрефиксер
      cascade: false
    }),
    require("postcss-advanced-variables")({//берет переменные из файла variables.json
      variables: JSON.parse(
        fs.readFileSync("./src/styles/variables.json", "utf-8")
      )
    }),
    require("postcss-nested"),//для вложенностей
    require("postcss-rgb"),//позволяет использ hex как rgb
    require("postcss-inline-svg")({//позволяет использ svg как фон в css
      removeFill: true,
      path: "./src/images/icons"
    }),
    require("cssnano"),//сжимает css
    require("postcss-pxtorem")({//переводит пиксели в рем
      rootValue: 16,//нач знач html
      propList: ["*", "!*border*"],// все кроме border
      selectorBlackList: [/^html$/]//исключ тег html и медиазапросы(1PX - не переведется в рем)
    })
  ]
};
