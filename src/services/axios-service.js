import Axios from 'axios';

export const localAxios = Axios.create({ baseURL: '/' });

// Tryn to find a solution to embed tweets without CORS block
export const twitterAxios = Axios.create({
  baseURL: 'https://api.twitter.com/1/statuses/oembed.json?url=',
  withCredentials: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});

export default {
  getLocaleFile(locale) {
    localAxios.baseURL = '/';
    return localAxios.get(`config/i18n/${locale.toLowerCase()}.json`);
  },
  getAppConfigFile() {
    localAxios.baseURL = '/';
    const appConfigPath = 
      process.env.NODE_ENV === 'production' ? 
        'config/app-config.json' : 
        'config/app-config-dev.json';
    return localAxios.get(appConfigPath);
  },
  getTweetEmbed(tweetUrl) {
    // Wont work since Cross Blocks
    return twitterAxios.get(tweetUrl);
  }
};
