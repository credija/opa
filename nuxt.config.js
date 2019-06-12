const pkg = require('./package');

let BASE_URL = process.env.BASE_URL;
if (BASE_URL !== undefined && 
  BASE_URL.length === 1 
  && BASE_URL.substr(BASE_URL.length - 1) === '/') {
  BASE_URL = '';
} else if (BASE_URL !== undefined && 
    BASE_URL.length > 0 
    && BASE_URL.substr(BASE_URL.length - 1) !== '/') {
    BASE_URL += '/';
  }

// TODO: Create page 404
// TODO: Compatibity and performance test in browsers (EDGE not working?)
module.exports = {
  mode: 'universal',
  env: {
    baseUrl: (BASE_URL !== undefined ? BASE_URL : ''),
    isDev: (process.env.NODE_ENV !== 'production')
  },
  router: {
    base: (BASE_URL !== undefined ? BASE_URL : '')
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
      { src: 'https://polyfill.io/v3/polyfill.min.js?flags=gated' }
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
    { src: '@/plugins/vue-intersect', ssr: false },
    { src: '@/plugins/global-mixins', ssr: false },
    { src: '@/plugins/filters', ssr: false },
  ],

  modules: [
    '@nuxtjs/axios'
  ],
  axios: {
  },

  build: {
    transpile: ['cool-emoji-picker', /^element-ui/],
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
      
      if (!ctx.isDev) {
        config.output.publicPath = './_nuxt/'
      }
    }
  }
}
