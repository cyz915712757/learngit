module.exports = {
  extends: "airbnb/legacy",
  parser: "esprima",
  parserOptions: {
    ecmaVersion: 5,
    sourceType: "module",
  },
  root: true,
  globals: {
    $: true,
  },
  rules: {
    "vars-on-top": "off",
    "no-unused-expressions": "off",
    "no-useless-return": "off",
    "arrow-parens": "off",
    "global-require": "off",
    "func-names": "off",
    "comma-dangle": ["error", "never"],
    "wrap-iife": ["error", "inside"],
    "no-underscore-dangle": "off",
    "linebreak-style": ["error", "unix"],
    "max-len": [1, 200],
    "no-console": "off",
    "no-debugger": "off",
    "no-use-before-define": ["error", {
      variables: false
    }],
    "class-methods-use-this": "off",
    "no-multi-spaces": ["error", {
      ignoreEOLComments: true
    }],
    "camelcase": "error",
    "curly": "error"
  }
};
