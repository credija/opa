import XmppService from '@/services/xmpp-service';
import NotificationService from '@/services/notification-service';
import FaviconService from '@/services/favicon-service';
import DocTitleService from '@/services/doc-title-service';
import PresenceEnum from '@/enums/presence-enum';
import StringUtils from '@/utils/string-utils';
import ObjectUtils from '@/utils/object-utils';
import MessageParser from '@/services/message-parser';
import { Strophe, $iq, $pres } from 'strophe.js';
import { MessageBox } from 'element-ui';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  onConnect(status) {
    switch (status) {
      default:
        break;
      case Strophe.Status.CONNECTED:
        console.log('CONNECTED');
        this.store.dispatch('app/updateIsAppLoading', true);
        this.store.dispatch('app/updateIsDisconnected', false);
        this.store.dispatch('app/updateIsLogging', false);
        XmppService.updateLoggedUserVcard();
        $nuxt.$router.push('/chat');
        XmppService.getRoster();
        break;
      case Strophe.Status.ATTACHED:
        console.log('ATTACHED');
        break;
      case Strophe.Status.CONNFAIL:
        console.error('ERROR: Connection Failed');
        break;
      case Strophe.Status.AUTHFAIL:
        console.error('ERROR: Auth Failed');
        $nuxt.$router.push('/?invalidCredentials=true');
        this.store.dispatch('app/updateIsLogging', false);
        break;
      case Strophe.Status.CONNTIMEOUT:
        console.error('ERROR: Connection Timeout');
        break;
      case Strophe.Status.DISCONNECTING:
        console.error('ERROR: Disconnecting');
        break;
      case Strophe.Status.DISCONNECTED:
        console.error('ERROR: Disconnected');
        this.store.dispatch('app/updateIsDisconnected', true);
        break;
    }
  },
  rosterCallback(iq) {
    const profileImageList = JSON.parse(localStorage.getItem('profileImageList'));
    if (profileImageList !== null) {
      this.store.dispatch('app/updateProfileImageList', profileImageList);
    }

    const rosterList = [];
    const rosterContacts = iq.getElementsByTagName('item');
    if (iq.query !== null) {
      for (let i = 0; i < rosterContacts.length; i++) {
        const rosterObj = {};
        const group = rosterContacts[i].getElementsByTagName('group')[0];
        rosterObj.username = StringUtils.removeAfterInclChar(rosterContacts[i].getAttribute('jid'), '@');
        
        if (rosterObj.username !== this.store.state.app.authUser.username) {
          rosterObj.name = rosterContacts[i].getAttribute('name');
          rosterObj.status = '';
          rosterObj.presence = { id: 'off', value: 'Offline' };
          rosterObj.group = group.childNodes[0].nodeValue;
          rosterList.push(rosterObj);
        }
      }

      rosterList.sort(function(obj1, obj2) {
        const textA = obj1.name.toUpperCase();
        const textB = obj2.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      
      this.store.dispatch('app/updateRosterList', rosterList);
      XmppService.updateRosterPresence();

      const ctx = this;
      setTimeout(function () {
        ctx.store.dispatch('app/updateIsAppLoading', false);
      }, 500);
    }
  },
  presenceHandler(presence) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;
    const rosterList = this.store.state.app.rosterList;
    const authUser = this.store.state.app.authUser.username;

    const show = presence.getElementsByTagName('show')[0];
    const status = presence.getElementsByTagName('status')[0];
    const type = presence.getAttribute('type');
    const from = StringUtils.removeAfterInclChar(presence.getAttribute('from'), '@');
    const rosterObj = rosterList.find(roster => 
      roster.username.toUpperCase() === from.toUpperCase());

    if (rosterList.length === 0 || from === authUser) {
      return true;
    }
    
    XmppService.profileImageCreator(presence);
    
    if (show !== undefined) {
      const showValue = show.textContent;
      this.store.dispatch('app/updatePresenceRosterContact', { 
        rosterObj: rosterObj, 
        presence: PresenceEnum.getPresenceById(showValue) 
      });
    } else if (type === 'unavailable' || type === 'error') {
      this.store.dispatch('app/updatePresenceRosterContact', { 
        rosterObj: rosterObj, 
        presence: { id: 'off', value: 'Offline' }
      });
      setTimeout(function () {
        const check = $pres({
          type: 'probe',
          to: rosterObj.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`
        });
        client.send(check);
      }, 5000);
    } else {
      this.store.dispatch('app/updatePresenceRosterContact', { 
        rosterObj: rosterObj, 
        presence: PresenceEnum.getPresenceById('on') 
      });
    }

    if (status !== undefined) {
      const statusValue = status.childNodes[0].nodeValue;
      this.store.dispatch('app/updateStatusRosterContact', { 
        rosterObj: rosterObj, 
        status: statusValue
      });
    }

    return true;
  },
  messageHandler(msg) {
    const context = this;
    const fromAttr = msg.getAttribute('from');
    if (fromAttr === null) return true;

    const locale = this.store.state.app.appLocale;
    const rosterList = this.store.state.app.rosterList;
    const conversationList = this.store.state.chat.conversationList;
    const activeConversation = this.store.state.chat.activeConversation;

    let bolFirstConversation = false;
    if (conversationList.length === 0) bolFirstConversation = true;

    const from = StringUtils.removeAfterInclChar(fromAttr, '@');
    const type = msg.getAttribute('type');
    const body = msg.getElementsByTagName('body')[0];
    const stamp = msg.getElementsByTagName('stamp')[0];
    const delay = msg.getElementsByTagName('delay')[0];
    const composing = msg.getElementsByTagName('composing')[0];
    const paused = msg.getElementsByTagName('paused')[0];

    let conversation = conversationList.find(conversationFind => 
      conversationFind.contact.username.toUpperCase() === from.toUpperCase());
    
    if (fromAttr === 'chat') {
      const msgContent = MessageParser.parseAdminMessage(body.textContent);
      let newDate = new Date();

      if (delay !== undefined) newDate = new Date(delay.getAttribute('stamp'));
      else if (stamp !== undefined) newDate = new Date(stamp.textContent);

      MessageBox.alert(`${newDate.toLocaleString(locale)}:<br> ` + 
      `<p style="word-wrap: break-word !important; white-space: pre-wrap !important;">${msgContent}</p>`, 
        context.translation.t('chat.adminMessageTitle'), 
      {
        showClose: false,
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'OK'
      });
      return true;
    } else if (type === 'chat' && body !== undefined) {
      const msgContent = body.textContent;
      let newDate = new Date();
      if (delay !== undefined) newDate = new Date(delay.getAttribute('stamp'));
      else if (stamp !== undefined) newDate = new Date(stamp.textContent);

      if (conversation !== undefined) {
        if (conversation.contact.username 
          === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
          conversation.numUnreadMsgs = 0;
        } else if (conversation.numUnreadMsgs < 99) {
          conversation.numUnreadMsgs += 1;
          
          if (conversation.numUnreadMsgs === 1) {
            const numUnreadConversation = this.store.state.chat.numUnreadConversation;
            this.store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation + 1);
            FaviconService.constructor(this.store).updateFavicon();
            DocTitleService.constructor(this.store).updateTitle();
          }
        }

        this.store.dispatch('chat/addMessageToConversation', { 
          messageList: conversation.list, 
          messageToAdd: { 
            msg: msgContent, 
            ownMessage: false, 
            stampDate: newDate 
          } 
        });
      } else {
        const rosterObj = rosterList.find(roster => 
          roster.username.toUpperCase() === from.toUpperCase());
        conversation = { 
          contact: rosterObj, 
          list: [], 
          numUnreadMsgs: 1, 
          isTyping: false,
          chatboxState: '',
          oldConversation: {
            lastStamp: null,
            isLoading: false,
            lastMessageId: '',
            lastRetrievedId: '',
            list: []
          }
        };
        
        XmppService.setLastMessageId(conversation);

        this.store.dispatch('chat/addMessageToConversation', { 
          messageList: conversation.list, 
          messageToAdd: { 
            msg: msgContent, 
            ownMessage: false,
            stampDate: newDate
          }
        });

        newDate.setSeconds(newDate.getSeconds() - 5);
        this.store.dispatch('chat/updateOldConversationLastStamp', { 
          oldConversation: conversation.oldConversation, 
          lastStamp: newDate.toISOString()
        });

        this.store.dispatch('chat/addConversationToList', conversation);

        if (conversation.contact.username 
          === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
          this.store.dispatch('chat/clearUnreadCounterConversation', conversation);
          this.store.dispatch('chat/updateOldConversation', { 
            conversation: conversation, 
            oldConversation: activeConversation.oldConversation
          });
          this.store.dispatch('chat/updateActiveConversation', conversation);
        } else {
          const numUnreadConversation = this.store.state.chat.numUnreadConversation;
          this.store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation + 1);
          FaviconService.constructor(this.store).updateFavicon();
          DocTitleService.constructor(this.store).updateTitle();
        }
      }

      if (!bolFirstConversation) {
        this.store.dispatch('chat/reorderConversationByConversation', conversation);
      }

      const ctx = this;
      setTimeout(function () {
        const messageBoxDoc = document.getElementById('message-box');
        if (messageBoxDoc) messageBoxDoc.scrollTop = messageBoxDoc.scrollHeight;
        NotificationService.constructor(ctx.store)
          .sendAudioNotification();
        NotificationService.constructor(ctx.store)
          .sendDesktopNotification(conversation.contact.name, msgContent);
        ctx.store.dispatch('chat/updateLastNotification', new Date());
      });
    } else if (composing !== undefined
      && from === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
      this.store.dispatch('chat/updateActiveConversationIsTyping', true);
    } else if (paused !== undefined 
      && from === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
      this.store.dispatch('chat/updateActiveConversationIsTyping', false);
    }

    return true;
  },
  updateUserAvatar(username) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

    const avatarIq = $iq({ 
      type: 'get',
      to: username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}` 
    })
      .c('vCard', { xmlns: 'vcard-temp' });
    client.sendIQ(avatarIq, XmppService.avatarCallback.bind(this));
  },
  vCardLoggedUser(iq) {
    const authUser = this.store.state.app.authUser;

    const vCardElement = iq.getElementsByTagName('vCard')[0];
   
    const photoTag = vCardElement.getElementsByTagName('PHOTO')[0];
    let photoType;
    let photoBin;
    if (photoTag !== undefined) {
      photoType = photoTag.getElementsByTagName('TYPE')[0].textContent;
      photoBin = photoTag.getElementsByTagName('BINVAL')[0].textContent;
      this.store.dispatch('app/updateAuthUserImageBin', { 
        authUser: authUser, 
        type: photoType,
        bin: photoBin, 
      });
    }
  }
};
