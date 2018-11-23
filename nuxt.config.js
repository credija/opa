const pkg = require('./package');
const BASE_URL = process.env.BASE_URL;
// TODO: Create page 404
// TODO: Teste em todos navegadores para verificar 
// performance e compatibilidade (Não havia funcionado no EDGE)
// TODO: Verificar porque ausente extendido está ocorrendo como aconteceu com Yuri (De aparecer Offline mas estava ausente extendido)
module.exports = {
  mode: 'universal',
  env: {
    baseUrl: (BASE_URL !== undefined ? BASE_URL : ''),
    isDev: (process.env.NODE_ENV !== 'production')
  },
  router: {
    base: (BASE_URL !== undefined ? `${BASE_URL}/` : '/')
  },
  buildDir: 'bundle',
  dev: (process.env.NODE_ENV !== 'production'),
  head: {
    title: 'Opa',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    script: [
      { src: 'https://cdn.polyfill.io/v2/polyfill.min.js' }
    ],
    link: [
      { 
        rel: 'icon', type: 'image/x-icon', 
        href: `${BASE_URL !== undefined ? BASE_URL : ''}/favicon/favicon-normal.png`, 
        id: 'favicon'
      },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto'}
    ],
  },

  loading: { color: '#fff' },

  css: [
    { src: '~global-styles/main.scss', lang: 'scss'},
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  plugins: [
    '@/plugins/element-ui',
    '@/plugins/vue-fontawesome',
    '@/plugins/i18n',
    { src: '@/plugins/global-mixins', ssr: false },
    { src: '@/plugins/filters', ssr: false },
  ],

  modules: [
    '@nuxtjs/axios'
  ],
  axios: {
  },

  build: {
    babel: {
      presets: ['@nuxt/babel-preset-app'],
      plugins: [
        [
          'component',
          {
            libraryName: 'element-ui',
            styleLibraryName: 'theme-chalk'
          }
        ]
      ]
    },
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options : {
            fix : true
          }
        });
        config.module.rules.push({
          test: /\.mp3$/,
          include: '/(assets\/audio)/',
          loader: 'file-loader',
        });
      }
    }
  }
}
