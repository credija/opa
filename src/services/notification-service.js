import DateUtils from '@utils/date-utils';
import NotificationAudio from '@assets/audio/notification.wav';
import ChatLogo from '@assets/img/chat-logo.png';
import Store from '@store/vuex-instance';
import Push from 'push.js';
import MessageParser from '@services/message-parser';

export default {
  sendAudioNotification() {
    const notificationEnabled = Store.state.chat.chatConfig.soundNotification;
    if (DateUtils.isDateLastNotificationMinutesOlder(1) && notificationEnabled) {
      const audio = new Audio(NotificationAudio);
      audio.play();
    }
  },
  sendDesktopNotification(name, message) {
    message = MessageParser.removeHtmlTags(message);
    if (DateUtils.isDateLastNotificationMinutesOlder(1) && Push.Permission.has()) {
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
