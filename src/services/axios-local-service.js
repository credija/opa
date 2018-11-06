import Axios from 'axios';

const axiosInstance = Axios.create({
  baseURL: '/',
});

axiosInstance.all = Axios.all;

export const LocalAxios = axiosInstance;

export default {
  getLocaleFile(locale) {
    return LocalAxios.get(`config/i18n/${locale.toLowerCase()}.json`);
  },
  getAppConfigFile() {
    const appConfigPath = 
      process.env.NODE_ENV === 'production' ? 
        'config/app-config.json' : 
        'config/app-config-dev.json';
    return LocalAxios.get(appConfigPath);
  }
};
