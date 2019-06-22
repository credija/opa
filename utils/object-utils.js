/* eslint-disable */
export default {
  getValidValue(fn, defaultVal) {
    try {
      if (fn() === undefined) {
        return defaultVal;
      }
      return fn();
    } catch (e) {
      return defaultVal;
    }
  },
  getValidUsername(fn) {
    return this.getValidValue(fn, 'INVALID_USERNAME');
  },
  cloneObject(obj) {
    const clone = {};
    for (let i in obj) {
      if (obj[i] != null && typeof obj[i] == 'object') {
        clone[i] = this.cloneObject(obj[i]);
      } else {
        clone[i] = obj[i];
      }
    }
    return clone;
  }
};
