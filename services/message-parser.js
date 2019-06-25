import EmojiService from '@/services/emoji-service';

export default {
  parseChatboxMessage(msg) {
    msg = this.escapeHTML(msg);

    // The parsing order is important!!!

    // Embeds
    // msg = this.convertTwitterUrlToEmbed(msg);

    // Links (and image links)
    msg = this.convertUrlToAnchorTag(msg);
    msg = this.convertUrlToImageTag(msg);

    // Convert emoji shortchut to IMG tag with the emoji
    msg = this.convertUnicodeToTwemoji(msg);
    return msg;
  },
  parseAdminMessage(msg) {
    msg = this.escapeHTML(msg);

    // The parsing order is important!!!

    // Convert emoji shortchut to IMG tag with the emoji
    msg = this.convertUnicodeToTwemoji(msg);
    return msg;
  },
  parseLastMessageConversation(msg) {
    msg = this.escapeHTML(msg);

    // The parsing order is important!!!
    // Convert emoji shortchut to IMG tag with the emoji
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
    const urlRegex = /\bwww(?!\S+(?:jpe?g|png|bmp|gif|webp|svg))\S+|https?:\/\/(?!\S+(?:jpe?g|png|bmp|gif|webp|svg))\S+/g;
    msg = msg.replace(urlRegex, function(url) {
      let anchorElement =
        '<a href="' + url + '" target="_blank">' + url + '</a>';
      if (url.substring(0, 3) === 'www') {
        const urlWithPrefix = 'http://' + url;
        anchorElement =
          '<a href="' + urlWithPrefix + '" target="_blank">' + url + '</a>';
      }
      return anchorElement;
    });
    return msg;
  },
  convertUrlToImageTag(msg) {
    const urlRegex = /(www)([/|.|\w|-])*\.(?:jpe?g|png|bmp|gif|webp|svg)|(http(s?):)([/|.|\w|-])*\.(?:jpe?g|png|bmp|gif|webp|svg)/g;
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
        '<a href="' +
        urlWithPrefix +
        '" target="_blank"> ' +
        '<img class="b-rounded max-size-chat-image img-opacity" src="' +
        urlWithPrefix +
        '"/>' +
        '</a>' +
        '</br>';

      return (
        '<a href="' +
        urlWithPrefix +
        '" target="_blank">' +
        url +
        '</a>' +
        imageElement
      );
    });
    return msg;
  },
  escapeHTML(msg) {
    return document
      .createElement('div')
      .appendChild(document.createTextNode(msg)).parentNode.innerHTML;
  },
  convertUnicodeToTwemoji(msg) {
    return EmojiService.twemoji().parse(msg);
  },
  replaceEmojiWithAltAttribute(msg) {
    return msg.replace(/<img.*?alt="(.*?)"[^\>]+>/g, '$1');
  },
  unescapeHtml(msg) {
    return msg
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  },

  // TODO: Twitter Embed
  convertTwitterUrlToEmbed(msg) {
    const twitterRegex = /https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/g;
    msg = msg.replace(twitterRegex, function(twitterMatch) {
      return `<iframe border=0 frameborder=0 height=250 width=550 src="${twitterMatch}"></iframe>`;
    });
    return msg;
  }
};
