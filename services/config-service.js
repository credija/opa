import Axios from 'axios';
const NuxtConfig = require('@/nuxt.config.js');

export default {
  async getConfigFile() {
    let appConfigPath = null;
    
    if (NuxtConfig.dev) {
      appConfigPath = '/config/app-config-dev.json';
    } else {
      appConfigPath = '/config/app-config.json';
    }

    const appConfig = await Axios.get(appConfigPath)
      .then((res) => {
        return res.data;
      })
      .catch(() => {
        return {
          VUE_APP_XMPP_SERVER_ADDRESS: 'http://chat:7070/http-bind',
          VUE_APP_XMPP_SERVER_DOMAIN: 'chat',
          VUE_APP_LOCALE: 'en-us'
        };
      });
    return appConfig;
  }
};