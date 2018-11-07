import Store from '@store/vuex-instance';
import Strophe from '@strophe/strophe-mod';
import Vue from 'vue';
import XmppService from '@services/xmpp-service';
import NotificationService from '@services/notification-service';
import FaviconService from '@services/favicon-service';
import DocTitleService from '@services/doc-title-service';
import PresenceEnum from '@enums/presence-enum';
import StringUtils from '@utils/string-utils';
import ObjectUtils from '@utils/object-utils';
import MessageParser from '@services/message-parser';
import { $iq, $pres } from 'strophe.js';
import { MessageBox } from 'element-ui';
import { i18n } from '@services/locale-service';

export default {
  onConnect(status) {
    switch (status) {
      default:
        break;
      case Strophe.Status.CONNECTED:
        console.log('CONNECTED');
        Store.dispatch('app/updateIsDisconnected', false);
        Store.dispatch('app/updateIsLogging', false);
        XmppService.updateLoggedUserVcard();
        XmppService.saveTimestampLogin();
        Vue.router.push('/chat');
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
        Vue.router.push('/login?invalidCredentials=true');
        Store.dispatch('app/updateIsLogging', false);
        break;
      case Strophe.Status.CONNTIMEOUT:
        console.error('ERROR: Connection Timeout');
        break;
      case Strophe.Status.DISCONNECTING:
        console.error('ERROR: Disconnecting');
        break;
      case Strophe.Status.DISCONNECTED:
        console.error('ERROR: Disconnected');
        Store.dispatch('app/updateIsDisconnected', true);
        break;
    }
  },
  rosterCallback(iq) {
    const profileImageList = JSON.parse(localStorage.getItem('profileImageList'));
    if (profileImageList !== null) {
      Store.dispatch('app/updateProfileImageList', profileImageList);
    }

    const rosterList = [];
    const rosterContacts = iq.getElementsByTagName('item');
    if (iq.query !== null) {
      for (let i = 0; i < rosterContacts.length; i++) {
        const rosterObj = {};
        const group = rosterContacts[i].getElementsByTagName('group')[0];
        rosterObj.username = StringUtils.removeAfterInclChar(rosterContacts[i].getAttribute('jid'), '@');
        
        if (rosterObj.username !== Store.state.app.authUser.username) {
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
      
      Store.dispatch('app/updateRosterList', rosterList);
      XmppService.updateRosterPresence();
    }
  },
  presenceHandler(presence) {
    const appConfig = Store.state.app.appConfig;
    const client = Store.state.app.xmppClient;

    const rosterList = Store.state.app.rosterList;
    const show = presence.getElementsByTagName('show')[0];
    const status = presence.getElementsByTagName('status')[0];
    const type = presence.getAttribute('type');
    const from = StringUtils.removeAfterInclChar(presence.getAttribute('from'), '@');
    const rosterObj = rosterList.find(roster => 
      roster.username.toUpperCase() === from.toUpperCase());

    if (rosterList.length === 0 || from === Store.state.app.authUser.username) {
      return true;
    }
    
    XmppService.profileImageCreator(presence);
    
    if (show !== undefined) {
      const showValue = show.textContent;
      rosterObj.presence = PresenceEnum.getPresenceById(showValue);
    } else if (type === 'unavailable' || type === 'error') {
      rosterObj.presence = { id: 'off', value: 'Offline' };
      setTimeout(function () {
        const check = $pres({
          type: 'probe',
          to: rosterObj.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`
        });
        client.send(check);
      }, 5000);
    } else {
      rosterObj.presence = { id: 'on', value: 'Online' };
    }

    if (status !== undefined) {
      const statusValue = status.childNodes[0].nodeValue;
      rosterObj.status = statusValue;
    }

    return true;
  },
  messageHandler(msg) {
    const locale = Store.state.app.appLocale;

    const fromAttr = msg.getAttribute('from');
    if (fromAttr === null) return true;

    const rosterList = Store.state.app.rosterList;
    const conversationList = Store.state.chat.conversationList;
    const activeConversation = Store.state.chat.activeConversation;

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
      const msgContent = MessageParser.parseMessage(body.textContent);
      let newDate = new Date();
      if (delay !== undefined) newDate = new Date(delay.getAttribute('stamp'));
      else if (stamp !== undefined) newDate = new Date(stamp.textContent);
      MessageBox.alert(`${newDate.toLocaleString(locale)}:<br> ` + 
      `<span class"text-justify">${msgContent}</span>`, i18n.t('chat.adminMessageTitle'), {
        showClose: false,
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'OK'
      });
      return true;
    } else if (type === 'chat' && body !== undefined) {
      const msgContent = MessageParser.parseMessage(body.textContent);
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
            const numUnreadConversation = Store.state.chat.numUnreadConversation;
            Store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation + 1);
            FaviconService.updateFavicon();
            DocTitleService.updateTitle();
          }
        }

        conversation.list.push({ 
          msg: msgContent, 
          ownMessage: false, 
          stamp: newDate.toLocaleString(locale), 
          stampDate: newDate 
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

        conversation.list.push({ 
          msg: msgContent, 
          ownMessage: false,
          stamp: newDate.toLocaleString(locale),
          stampDate: newDate
        });

        newDate.setSeconds(newDate.getSeconds() - 5);
        conversation.oldConversation.lastStamp = newDate.toISOString();

        conversationList.push(conversation);

        if (conversation.contact.username 
          === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
          conversation.numUnreadMsgs = 0;
          conversation.oldConversation = activeConversation.oldConversation;
          Store.dispatch('chat/updateActiveConversation', conversation);
        } else {
          const numUnreadConversation = Store.state.chat.numUnreadConversation;
          Store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation + 1);
          FaviconService.updateFavicon();
          DocTitleService.updateTitle();
        }
      }

      if (!bolFirstConversation) {
        XmppService.reorderConversationsByConversation(conversation);
      }

      setTimeout(function () {
        const messageBoxDoc = document.getElementById('messageBox');
        if (messageBoxDoc) messageBoxDoc.scrollTop = messageBoxDoc.scrollHeight;
        NotificationService.sendAudioNotification();
        NotificationService.sendDesktopNotification(conversation.contact.name, msgContent);
        Store.dispatch('chat/updateLastNotification', new Date());
      });
    } else if (composing !== undefined
      && from === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
      activeConversation.isTyping = true;
    } else if (paused !== undefined 
      && from === ObjectUtils.getValidUsername(() => activeConversation.contact.username)) {
      activeConversation.isTyping = false;
    }

    return true;
  },
  updateUserAvatar(username) {
    const appConfig = Store.state.app.appConfig;

    const client = Store.state.app.xmppClient;

    const avatarIq = $iq({ 
      type: 'get',
      to: username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}` 
    })
      .c('vCard', { xmlns: 'vcard-temp' });
    client.sendIQ(avatarIq, XmppService.avatarCallback);
  },
  vCardLoggedUser(iq) {
    const authUser = Store.state.app.authUser;

    const vCardElement = iq.getElementsByTagName('vCard')[0];
    let formalName = '';
    if (vCardElement.getElementsByTagName('FN')[0] !== undefined) {
      formalName = vCardElement.getElementsByTagName('FN')[0].textContent;
    } else {
      formalName = iq.getAttribute('from');
    }

    authUser.formalName = formalName;
   
    const photoTag = vCardElement.getElementsByTagName('PHOTO')[0];
   

    let photoType;
    let photoBin;
    if (photoTag !== undefined) {
      photoType = photoTag.getElementsByTagName('TYPE')[0].textContent;
      photoBin = photoTag.getElementsByTagName('BINVAL')[0].textContent;
      Vue.set(authUser, 'photoType', photoType);
      Vue.set(authUser, 'photoBin', photoBin);
    }
  }
};
