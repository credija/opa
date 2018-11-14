import Vue from 'vue'
import XmppService from '@/services/xmpp-service';
import PresenceEnum from '@/enums/presence-enum';

export default ({ store }) => {
  Vue.prototype.dispatchHappyEmoji = () => { store.dispatch('chat/updateChatboxEmoji', 'happy') };
  Vue.prototype.dispatchThinkingEmoji = () => { store.dispatch('chat/updateChatboxEmoji', 'thinking') };
  Vue.prototype.dispatchPensiveEmoji = () => { store.dispatch('chat/updateChatboxEmoji', 'pensive') };
  Vue.prototype.dispatchConfusedEmoji = () => { store.dispatch('chat/updateChatboxEmoji', 'confused') };
  Vue.prototype.changePresenceUserAction = () => {
    store.dispatch('chat/updateLastMessageSentStamp', new Date());
    if (store.state.chat.isPresenceAway) {
      XmppService.constructor(store).sendChangePresenceSignal(store.state.chat.lastPresence);
      store.dispatch('app/updateAuthUserPresence', PresenceEnum
        .getPresenceById(store.state.chat.lastPresence));
        store.dispatch('chat/updateIsPresenceAway', false);
    }
   };
}
