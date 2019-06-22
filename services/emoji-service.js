import Twemoji from 'twemoji';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  twemoji() {
    return Twemoji;
  },

  localTwemoji() {
    Twemoji.base = `${process.env.baseUrl}/emoji/`;
    return Twemoji;
  },

  getEmojiImgFromCodepoint(codepoint) {
    return this.parse(Twemoji.convert.fromCodePoint(codepoint));
  }
};
