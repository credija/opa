export default {
  sleep(ms) {
    const now = new Date().getTime();
    while (new Date().getTime() < now + ms) { /* SLEEPING... */ } 
  }
};
