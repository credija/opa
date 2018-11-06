

import EmojiService from '@services/emoji-service';

export default {
  parseMessage(msg) {
    msg = this.escapeHTML(msg);
    msg = this.convertUrlToAnchorTag(msg);
    msg = this.convertUrlToImageTag(msg);
    msg = this.convertNewlineToBrTag(msg);
    msg = this.convertEmojiShortcutToUnicode(msg);
    msg = this.convertUnicodeToTwemoji(msg);
    return msg;
  },
  removeHtmlTags(msg) {
    const tmp = document.createElement('div');
    tmp.innerHTML = msg;

    let res = tmp.textContent || tmp.innerText || '';
    res.replace('\u200B', '');
    res = res.trim();

    return res;
  },
  convertNewlineToBrTag(msg) {
    return (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
  },
  convertUrlToAnchorTag(msg) {
    const urlRegex = /(\bwww(?!\S+(?:jpe?g|png|bmp|gif|webp|svg))\S+|https?:\/\/(?!\S+(?:jpe?g|png|bmp|gif|webp|svg))\S+)/g;
    return msg.replace(urlRegex, function(url) {
      let anchorElement = '<a href="' + url + '" target="_blank">' + url + '</a>';
      if (url.substring(0, 3) === 'www') {
        const urlWithPrefix = 'http://' + url;
        anchorElement = '<a href="' + urlWithPrefix + '" target="_blank">' + url + '</a>';
      }
      return anchorElement;
    });
  },
  convertUrlToImageTag(msg) {
    const urlRegex = /((www)([/|.|\w|-])*\.(?:jpe?g|png|bmp|gif|webp|svg)|(http(s?):)([/|.|\w|-])*\.(?:jpe?g|png|bmp|gif|webp|svg))/g;
    let imageElement = '';
    msg = msg.replace(urlRegex, function(url) {
      let urlWithPrefix = url;
      
      if (url.substring(0, 3) === 'www') {
        urlWithPrefix = 'http://' + url;
      }

      imageElement = 
      '</br>' +
      '<small>Pré-visualização:</small>' +
      '</br>' +
        '<a href="' + urlWithPrefix + '" target="_blank"> ' + 
          '<img class="b-rounded max-size-chat-image img-opacity" src="' + urlWithPrefix + '"/>' +
        '</a>' +
      '</br>';

      return '<a href="' + urlWithPrefix + '" target="_blank">' + url + '</a>';
    });
    return msg + imageElement;
  },
  escapeHTML(msg) {
    return document.createElement('div').appendChild(document.createTextNode(msg)).parentNode.innerHTML;
  },
  convertEmojiShortcutToUnicode(msg) {
    const emojiShortcutRegex = /((:smiling:|:grin:|:joy:|:innocent:|:wink:|:heart_eyes:|:stuck_out_tongue:|:antonished:|:expressionless:|:cry:|:pensive:|:sad:|:angry:|:sleeping:|:tired:|:unamused:|:facepalm:|:heart:|:thumbsup:|:thumbsdown:|:poop:|:hear-no-monkey:|:see-no-monkey:|:speak-no-monkey:))/g;
    return msg.replace(emojiShortcutRegex, function(emojiShortcut) {
      return EmojiService.localTwemoji()
        .convert.fromCodePoint(EmojiService.getEmojiByShortcut(emojiShortcut).codepoint);
    });
  },
  convertUnicodeToTwemoji(msg) {
    return EmojiService.localTwemoji().parse(msg);
  },
  unescapeHtml(msg) {
    return msg
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, '\'');
  }
};
