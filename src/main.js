import "./styles/main.pcss";//файл стилей pcss
if (process.env.NODE_ENV === "development") {// условие, только для dev
  require("file-loader!./index.pug");//файл с разметкой pug
}

import "./scripts/skills";//java script модули