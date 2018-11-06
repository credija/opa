import MessageParser from '@services/message-parser';

export default {
  isStringLengthValid(string, minLength) {
    if (string.trim().length === 0) {
      return false;
    } else if (string.length < minLength) {
      return false;
    }
    return true;
  },
  isStringTrimLengthValid(string, minLength) {
    if (string.toString().trim().length < minLength) {
      return false;
    }
    return true;
  },
  capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  },
  removeAfterInclChar(string, char) {
    const cutIndex = string.indexOf(char);
    string = string.substring(0, cutIndex !== -1 ? cutIndex : string.length);
    return string;
  },
  truncateOnWord(str, limit) {
    str = MessageParser.removeHtmlTags(str);

    if (str.length < limit) {
      return str;
    }
    
    const trimmable = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E' + 
    '\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
    const reg = new RegExp('(?=[' + trimmable + '])');
    const words = str.split(reg);
    let count = 0;

    let truncatedWord = words.filter(function(word) {
      count += word.length;
      return count <= limit;
    }).join('') + '...';

    if (truncatedWord === '...') {
      truncatedWord = str.substring(0, limit) + '...';
    }
    return truncatedWord;
  },
  randomIdGenerator() {
    const length = 32;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
};
