import DateUtils from '@/utils/date-utils';
import ChatLogo from '@/assets/img/chat-logo.png';
import Push from 'push.js';
import MessageParser from '@/services/message-parser';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  sendAudioNotification() {
    const notificationEnabled = this.store.state.chat.chatConfig.soundNotification;
    if (DateUtils.constructor(this.store).isDateLastNotificationMinutesOlder(1) && notificationEnabled) {
      const audio = new Audio('/audio/notification.mp3');
      audio.play();
    }
  },
  sendDesktopNotification(name, message) {
    message = MessageParser.removeHtmlTags(message);
    if (DateUtils.constructor(this.store).isDateLastNotificationMinutesOlder(1) && Push.Permission.has()) {
      Push.create(name, {
        body: message,
        icon: ChatLogo,
        timeout: 4000,
        onClick: function () {
          window.focus();
          this.close();
        }
      });
    }
  }
};
