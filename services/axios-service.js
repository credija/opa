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
  getTweetEmbed(tweetUrl) {
    // Wont work since Cross Blocks
    return twitterAxios.get(tweetUrl);
  }
};
