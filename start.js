// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require("@babel/register")({
    presets: [[
        "@babel/preset-env", {
          "useBuiltIns": "usage",
          "corejs": "2.6.11"
        }]],
    plugins:[
        "@babel/transform-runtime"
    ]
  });
  
  // Import the rest of our application.
  module.exports = require('./index.js')
  