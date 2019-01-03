
export default {
  removeAfterHyphen(value) {
    const cutIndex = value.indexOf('-');
    value = value.substring(0, cutIndex !== -1 ? cutIndex : value.length);
    return value;
  },
  isDateToday(date, appLocale) {
    const isToday = (new Date().toDateString() == date.toDateString());
    
    if (isToday) {
      return date.toLocaleTimeString(appLocale);
    }

    return date.toLocaleString(appLocale);
  }
};
