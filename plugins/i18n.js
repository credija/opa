import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);

export default ({ app, store }) => {

  app.i18n = new VueI18n({
    locale: store.state.app.appLocale,
    fallbackLocale: 'en-us',
    messages: {
      'en-us': require('@/static/locales/en-us.json'),
      'pt-br': require('@/static/locales/pt-br.json'),
      'de-de': require('@/static/locales/de-de.json')
    }
  })

  app.i18n.path = (link) => {
    if (app.i18n.locale === app.i18n.fallbackLocale) {
      return `/${link}`
    }

    return `/${app.i18n.locale}/${link}`
  }
}
