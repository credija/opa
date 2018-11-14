
import Twemoji from 'twemoji';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  emojiArray() {
    return [ 
      { codepoint: '1F642', shortcut: ':smiling:', description: 'Smiling Face' },
      { codepoint: '1F601', shortcut: ':grin:', description: 'Grin Face' },
      { codepoint: '1F602', shortcut: ':joy:', description: 'Joy Face' },
      { codepoint: '1F607', shortcut: ':innocent:', description: 'Innocent Face' },
      { codepoint: '1F609', shortcut: ':wink:', description: 'Wink Face' },
      { codepoint: '1F60D', shortcut: ':heart_eyes:', description: 'Heart Eye Face' },
      { codepoint: '1F61B', shortcut: ':stuck_out_tongue:', description: 'Stuck Out Tongue Face' },
      { codepoint: '1F632', shortcut: ':antonished:', description: 'Antonished Face' },
      { codepoint: '1F611', shortcut: ':expressionless:', description: 'Expressionless Face' },
      { codepoint: '1F622', shortcut: ':cry:', description: 'Cry Face' },
      { codepoint: '1F614', shortcut: ':pensive:', description: 'Pensive Face' },
      { codepoint: '2639', shortcut: ':sad:', description: 'Sad Face' },
      { codepoint: '1F620', shortcut: ':angry:', description: 'Angry Face' },
      { codepoint: '1F634', shortcut: ':sleeping:', description: 'Sleeping Face' },
      { codepoint: '1F62B', shortcut: ':tired:', description: 'Tired Face' },
      { codepoint: '1F612', shortcut: ':unamused:', description: 'Unamused Face' },
      { codepoint: '1F926', shortcut: ':facepalm:', description: 'Facepalm' },
      { codepoint: '2764', shortcut: ':heart:', description: 'Heart' },
      { codepoint: '1F44D', shortcut: ':thumbsup:', description: 'Thumbs Up' },
      { codepoint: '1F44E', shortcut: ':thumbsdown:', description: 'Thumbs Down' },
      { codepoint: '1F4A9', shortcut: ':poop:', description: 'Poop' },
      { codepoint: '1F649', shortcut: ':hear-no-monkey:', description: 'Hear No Evil Monkey' },
      { codepoint: '1F648', shortcut: ':see-no-monkey:', description: 'See No Evil Monkey' },
      { codepoint: '1F64A', shortcut: ':speak-no-monkey:', description: 'Speak No Evil Monkey' },
    ];
  },

  getEmojiByShortcut(shortcut) {
    return this.emojiArray().find(emoji => emoji.shortcut === shortcut);
  },

  localTwemoji() {
    Twemoji.base = '/emoji/';
    return Twemoji;
  },

  getEmojiImg(codepoint) {
    return this.localTwemoji().parse(Twemoji.convert.fromCodePoint(codepoint));
  },
};
