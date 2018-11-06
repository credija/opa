module.exports = {
  presets: [
    ['@vue/app', {
      useBuiltIns: false
    }]
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
};
