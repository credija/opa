
export default {
  removeAfterHyphen(value) {
    const cutIndex = value.indexOf('-');
    value = value.substring(0, cutIndex !== -1 ? cutIndex : value.length);
    return value;
  },
  isDateToday(date) {
    const year = date.substring(6, 10);
    const month = date.substring(3, 5);
    const day = date.substring(0, 2);
    const filterDate = new Date(year, month - 1, day);
    const isToday = (new Date().toDateString() === filterDate.toDateString());

    if (isToday) {
      return date.substring(11, 16);
    }
    return date;
  }
};
