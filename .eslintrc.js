module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/airbnb'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': 0,
    'no-console': 0,
    'no-param-reassign': 0,
    'no-trailing-spaces': 0,
    'import/prefer-default-export': 0,
    'no-underscore-dangle': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'comma-dangle': 0,
    'object-shorthand': 0,
    'arrow-parens': 0,
    'arrow-body-style': 0,
    'radix': 0,
    'func-names': 0,
    'no-mixed-operators': 0,
    'space-before-function-paren': 0,
    'prefer-template': 0,
    'import/no-extraneous-dependencies': 0,
    'no-plusplus': 0,
    'prefer-arrow-callback': 0,
    'prefer-destructuring': 0,
    'no-throw-literal': 0,
    'no-restricted-globals': 0,
    'no-nested-ternary': 0,
    'consistent-return': 0
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
