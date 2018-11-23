
import Twemoji from 'twemoji';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  emojiArray() {
    return [ 
      { codepoint: '1F642', shortcut: '🙂', description: 'Smiling Face' },
      { codepoint: '1F601', shortcut: '😁', description: 'Grin Face' },
      { codepoint: '1F602', shortcut: '😁', description: 'Joy Face' },
      { codepoint: '1F607', shortcut: '😇', description: 'Innocent Face' },
      { codepoint: '1F609', shortcut: '😉', description: 'Wink Face' },
      { codepoint: '1F60D', shortcut: '😍', description: 'Heart Eye Face' },
      { codepoint: '1F61B', shortcut: '😛', description: 'Stuck Out Tongue Face' },
      { codepoint: '1F632', shortcut: '😲', description: 'Antonished Face' },
      { codepoint: '1F611', shortcut: '😑', description: 'Expressionless Face' },
      { codepoint: '1F622', shortcut: '😢', description: 'Cry Face' },
      { codepoint: '1F614', shortcut: '😔', description: 'Pensive Face' },
      { codepoint: '2639', shortcut: '☹️', description: 'Sad Face' },
      { codepoint: '1F620', shortcut: '😠', description: 'Angry Face' },
      { codepoint: '1F634', shortcut: '😴', description: 'Sleeping Face' },
      { codepoint: '1F62B', shortcut: '😫', description: 'Tired Face' },
      { codepoint: '1F612', shortcut: '😒', description: 'Unamused Face' },
      { codepoint: '1F926', shortcut: '🤦', description: 'Facepalm' },
      { codepoint: '2764', shortcut: '❤️', description: 'Heart' },
      { codepoint: '1F44D', shortcut: '👍', description: 'Thumbs Up' },
      { codepoint: '1F44E', shortcut: '👎', description: 'Thumbs Down' },
      { codepoint: '1F4A9', shortcut: '💩', description: 'Poop' },
      { codepoint: '1F649', shortcut: '🙉', description: 'Hear No Evil Monkey' },
      { codepoint: '1F648', shortcut: '🙈', description: 'See No Evil Monkey' },
      { codepoint: '1F64A', shortcut: '🙊', description: 'Speak No Evil Monkey' },
    ];
  },

  getEmojiByShortcut(shortcut) {
    return this.emojiArray().find(emoji => emoji.shortcut === shortcut);
  },

  localTwemoji() {
    Twemoji.base = `${process.env.baseUrl}/emoji/`;
    return Twemoji;
  },

  getEmojiImg(codepoint) {
    return this.localTwemoji().parse(Twemoji.convert.fromCodePoint(codepoint));
  },
};
