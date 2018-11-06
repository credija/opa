import Store from '@store/vuex-instance';
import PresenceEnum from '@enums/presence-enum';
import XmppService from '@services/xmpp-service';

export default {
  dispatchMixin() {
    return {
      methods: {
        dispatchHappyEmoji() {
          Store.dispatch('chat/updateChatboxEmoji', 'happy');
        },
        dispatchThinkingEmoji() {
          Store.dispatch('chat/updateChatboxEmoji', 'thinking');
        },
        dispatchPensiveEmoji() {
          Store.dispatch('chat/updateChatboxEmoji', 'pensive');
        },
        dispatchConfusedEmoji() {
          Store.dispatch('chat/updateChatboxEmoji', 'confused');
        },
        changePresenceUserAction() {
          Store.dispatch('chat/updateLastMessageSentStamp', new Date());
          if (Store.state.chat.isPresenceAway) {
            Store.state.app.authUser.presence = PresenceEnum
              .getPresenceById(Store.state.chat.lastPresence);
            XmppService.sendChangePresenceSignal(Store.state.chat.lastPresence);
            Store.dispatch('chat/updateIsPresenceAway', false);
          }
        }
      }
    };
  }
};
