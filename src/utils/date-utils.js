
import Store from '@store/vuex-instance';

export default {
  isDateVal(dateBefore, dateAfter) {
    const yearBefore = dateBefore.substring(6, 10);
    const monthBefore = dateBefore.substring(3, 5);
    const dayBefore = dateBefore.substring(0, 2);
    const dDateBefore = new Date(yearBefore, monthBefore - 1, dayBefore);
    dDateBefore.setDate(dDateBefore.getDate() + 1); 

    const yearAfter = dateAfter.substring(6, 10);
    const monthAfter = dateAfter.substring(3, 5);
    const dayAfter = dateAfter.substring(0, 2);
    const dDateAfter = new Date(yearAfter, monthAfter - 1, dayAfter);

    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (dDateBefore.toDateString() === dDateAfter.toDateString() 
      && todayDate.toDateString() === dDateAfter.toDateString()) {
      return 'Hoje';
    } else if (dDateBefore < dDateAfter
    && yesterdayDate.toDateString() === dDateAfter.toDateString()) {
      return 'Ontem';
    } else if (dDateBefore.toDateString() === dDateAfter.toDateString()) {
      return 'Dia ' + dateAfter.substring(0, 10);
    }
    return null;
  },
  isDateMinutesOlder(minutes, date) {
    const minutesOlder = minutes * 60 * 1000;
    if (Math.abs((date - new Date())) > minutesOlder) {
      return true;
    }
    return false;
  },
  isDateLastNotificationMinutesOlder(minutes) {
    return this.isDateMinutesOlder(minutes, Store.state.chat.lastNotification);
  },
  isDateLastMessageSentMinutesOlder(minutes) {
    return this.isDateMinutesOlder(minutes, Store.state.chat.lastMessageSentStamp);
  }
};
