import Store from '@store/vuex-instance';
import XmppUtils from '@utils/xmpp-utils';
import { Strophe, $iq, $pres, $msg } from 'strophe.js';
import StringUtils from '@utils/string-utils';
import FormatUtils from '@utils/format-utils';
import Vue from 'vue';
import 'strophejs-plugin-rsm';
import '@strophe/strophe-mam-mod';
import MessageParser from '@services/message-parser';

export default {
  loginXmpp(username, password) {
    const appConfig = Store.state.app.appConfig;

    let conn = null;
    let usernameCred = username.toLowerCase();
    if (!usernameCred.includes(`@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`)) {
      usernameCred += `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`;
    }

    const connUrl = appConfig.VUE_APP_XMPP_SERVER_ADDRESS;

    conn = new Strophe.Connection(connUrl);
    Store.dispatch('app/updateXmppClient', conn);
    conn.connect(usernameCred, password, XmppUtils.onConnect);
  },
  trySessionRestore() {
    const appConfig = Store.state.app.appConfig;
    const connUrl = appConfig.VUE_APP_XMPP_SERVER_ADDRESS;

    let resultBol = false;
    const conn = new Strophe.Connection(connUrl);
    Store.dispatch('app/updateXmppClient', conn);
    try {
      const chatCreds = JSON.parse(localStorage.getItem('lsCreds'));
      if (chatCreds !== null) {
        conn.restore(chatCreds.jid, XmppUtils.onConnect);
        resultBol = true;
      } else {
        resultBol = false;
      }
      return resultBol;
    } catch (e) {
      console.error('Session Restore Error: ', e);
      return resultBol;
    }
  },
  saveTimestampLogin() {
    localStorage.setItem('isLoggedChat', JSON.stringify({ value: Store.state.app.chatTimestamp }));
  },
  getRoster() {
    const client = Store.state.app.xmppClient;
    const iq = $iq({
      type: 'get'
    }).c('query', {
      xmlns: 'jabber:iq:roster'
    });
    client.sendIQ(iq, XmppUtils.rosterCallback);
    client.addHandler(XmppUtils.presenceHandler, null, 'presence');
    client.addHandler(XmppUtils.messageHandler, null, 'message', null, null, null);
    client.send($pres());
    Store.dispatch('chat/updateLastPresence', 'on');
  },
  updateRosterPresence() {
    const appConfig = Store.state.app.appConfig;

    const rosterList = Store.state.app.rosterList;
    const client = Store.state.app.xmppClient;
    const profileImageList = Store.state.app.profileImageList;
    const authUser = Store.state.app.authUser;
    
    for (let i = 0; i < rosterList.length; i++) {
      const check = $pres({
        type: 'probe',
        to: rosterList[i].username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
        from: authUser.username
      });
      client.send(check);
    }
    
    setTimeout(function () {
      Store.dispatch('app/updateRosterFirstLoad', false);
    }, 3000);

    setTimeout(function () {
      localStorage.setItem('profileImageList', JSON.stringify(profileImageList));
    }, 5000);

    setTimeout(function () {
      Store.dispatch('app/updateIsChatReady', true);
    }, 2000);
  },
  sendMessage(msg, to, date) {
    const appConfig = Store.state.app.appConfig;

    const client = Store.state.app.xmppClient;
    const m = $msg({
      to: to + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      type: 'chat'
    })
      .c('stamp')
      .t(date.toISOString())
      .up()
      .c('body')
      .t(msg);
    client.send(m);
  },
  reorderConversationsByActive() {
    const conversationList = Store.state.chat.conversationList;
    const activeConversation = Store.state.chat.activeConversation;

    const reorderedConversations = conversationList.filter(conv => 
      conv.contact.username !== activeConversation.contact.username);
    reorderedConversations.unshift(activeConversation);
    Store.dispatch('chat/updateConversationList', reorderedConversations);
  },
  reorderConversationsByConversation(conversation) {
    const conversationList = Store.state.chat.conversationList;

    const reorderedConversations = conversationList.filter(conv => 
      conv.contact.username !== conversation.contact.username);
    reorderedConversations.unshift(conversation);
    Store.dispatch('chat/updateConversationList', reorderedConversations);
  },
  sendChatSignal(jid, notification) {
    const appConfig = Store.state.app.appConfig;

    const client = Store.state.app.xmppClient;
    const chatSignal = $msg({ 
      to: jid + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, 
      type: 'chat' 
    })
      .c(notification, { xmlns: Strophe.NS.CHATSTATES });
    client.send(chatSignal);
  },
  profileImageCreator(presence) {
    const profileImageList = Store.state.app.profileImageList;

    const from = StringUtils.removeAfterInclChar(presence.getAttribute('from'), '@');
    const photo = presence.getElementsByTagName('x')[0];
    let photoId = null;
    if (photo !== undefined) {
      photoId = photo.getElementsByTagName('photo')[0].textContent;
    }

    const profileImageObj = profileImageList.find(profileImage => 
      profileImage.username.toUpperCase() === from.toUpperCase());
    
    if (profileImageObj === undefined) {
      profileImageList.push({ 
        username: from, 
        hash: photoId, 
        type: null, 
        bin: null 
      });
      XmppUtils.updateUserAvatar(from);
    } else if (profileImageObj !== undefined 
        && profileImageObj.hash !== photoId) {
      if (photoId === null) {
        profileImageObj.hash = 'null_hash';
      } else {
        profileImageObj.hash = photoId;
      }
      
      XmppUtils.updateUserAvatar(from);
    }
  },
  avatarCallback(iq) {
    const profileImageList = Store.state.app.profileImageList;

    const from = StringUtils.removeAfterInclChar(iq.getAttribute('from'), '@');
    const vCardElement = iq.getElementsByTagName('vCard')[0];
    const photoTag = vCardElement.getElementsByTagName('PHOTO')[0];

    const profileImageObj = profileImageList.find(profileImage => 
      profileImage.username.toUpperCase() === from.toUpperCase());

    let photoType;
    let photoBin;
    if (photoTag !== undefined) {
      photoType = photoTag.getElementsByTagName('TYPE')[0].textContent;
      photoBin = photoTag.getElementsByTagName('BINVAL')[0].textContent;
      Vue.set(profileImageObj, 'type', photoType);
      Vue.set(profileImageObj, 'bin', photoBin);
    } else {
      profileImageObj.type = undefined;
      profileImageObj.bin = undefined;
    }
  },
  updateLoggedUserVcard() {
    const appConfig = Store.state.app.appConfig;

    const client = Store.state.app.xmppClient;
    const clientUsername = StringUtils.removeAfterInclChar(client.jid, '@');
    let authUser = Store.state.app.authUser;

    Store.dispatch('app/updateAuthUser', { 
      username: clientUsername, 
      presence: { id: 'on', value: 'Online' }
    });
    
    authUser = Store.state.app.authUser;

    const avatarIq = $iq({ 
      type: 'get',
      to: authUser.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}` 
    })
      .c('vCard', { xmlns: 'vcard-temp' });
    client.sendIQ(avatarIq, XmppUtils.vCardLoggedUser);
  },
  sendChangePresenceSignal(presence) {
    const client = Store.state.app.xmppClient;
    let presenceSignal = {};

    if (presence === 'on') {
      presenceSignal = $pres();
    } else {
      presenceSignal = $pres().c('show').t(presence);
    }
    
    client.send(presenceSignal);
  },
  updateProfileImage(profileImage) {
    const client = Store.state.app.xmppClient;
    const authUser = Store.state.app.authUser;
    FormatUtils.getBase64FromFile(profileImage)
      .then((base64File) => {
        const iq = $iq({ 
          type: 'set'
        })
          .c('vCard', { xmlns: 'vcard-temp' })
          .c('PHOTO')
          .c('TYPE', profileImage.type)
          .up()
          .c('BINVAL', base64File);

        client.sendIQ(iq);
        Vue.set(authUser, 'photoType', profileImage.type);
        Vue.set(authUser, 'photoBin', base64File);
        const updateAvatarPres = $pres()
          .c('x', { xmlns: 'vcard-temp:x:update' })
          .c('photo', {}, StringUtils.randomIdGenerator())
          .up()
          .c('show')
          .t(authUser.presence.id);
        client.send(updateAvatarPres);
      });
  },
  deleteProfileImage() {
    const client = Store.state.app.xmppClient;
    const authUser = Store.state.app.authUser;
    const iq = $iq({ 
      type: 'set'
    })
      .c('vCard', { xmlns: 'vcard-temp' })
      .c('PHOTO')
      .c('TYPE', '')
      .up()
      .c('BINVAL', '');

    client.sendIQ(iq);
    Vue.set(authUser, 'photoType', undefined);
    Vue.set(authUser, 'photoBin', undefined);
    const updateAvatarPres = $pres()
      .c('x', { xmlns: 'vcard-temp:x:update' })
      .c('photo', {}, StringUtils.randomIdGenerator())
      .up()
      .c('show')
      .t(authUser.presence.id);
    client.send(updateAvatarPres);
  },
  getOldMessages(activeConversation) {
    const appConfig = Store.state.app.appConfig;

    const messageBox = document.getElementById('messageBox');
    const scrollHeight = messageBox.scrollHeight;
    const client = Store.state.app.xmppClient;
    const authUser = Store.state.app.authUser;
    const startOfTime = new Date(1970, 0, 1).toISOString();

    if (Number(activeConversation.oldConversation.lastRetrievedId) 
      === Number(activeConversation.oldConversation.lastMessageId) 
    && Number(activeConversation.oldConversation.lastMessageId) !== 0) {
      activeConversation.oldConversation.isLoading = true;
      setTimeout(() => {
        activeConversation.oldConversation.isLoading = false;
        activeConversation.oldConversation.noResult = true;
      }, 300);
      return;
    }

    if (activeConversation.oldConversation.lastStamp === null) {
      activeConversation.oldConversation.lastStamp = new Date().toISOString();
    }

    activeConversation.oldConversation.isLoading = true;
    let isFirstMessage = true;
    const messageList = [];
    client.mam.query(authUser.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, {
      with: activeConversation.contact.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      start: startOfTime,
      end: activeConversation.oldConversation.lastStamp,
      before: activeConversation.oldConversation.lastRetrievedId,
      max: 2,
      isGroup: false,
      onMessage: function(message) {
        const locale = Store.state.app.appLocale;
        const resultId = message.getElementsByTagName('result')[0].getAttribute('id');
        const stamp = message.getElementsByTagName('delay')[0].getAttribute('stamp');
        const messageBody = message.getElementsByTagName('body')[0].textContent;
        const from = StringUtils
          .removeAfterInclChar(message.getElementsByTagName('message')[0].getAttribute('from'), '@');
        const formattedDate = new Date(stamp).toLocaleString(locale);
        const unformattedDate = new Date(stamp);
        const chatMessageFormated = MessageParser.parseMessage(messageBody);

        if (isFirstMessage) {
          activeConversation.oldConversation.lastRetrievedId = resultId;
          isFirstMessage = false;
        }

        let ownMessage = false;
        if (from === authUser.username) {
          ownMessage = true;
        }
        messageList.push({ 
          msg: chatMessageFormated, 
          ownMessage, 
          stamp: formattedDate, 
          stampDate: unformattedDate 
        });
        
        return true;
      },
      onComplete: function() {
        activeConversation.oldConversation.isLoading = false;

        if (messageList.length === 0) {
          activeConversation.oldConversation.noResult = true;
        } else {
          activeConversation.oldConversation.list = messageList
            .concat(activeConversation.oldConversation.list);
        }

        setTimeout(function () {
          if (messageBox !== undefined) {
            messageBox.scrollTop = messageBox.scrollHeight - scrollHeight;
          }
        });
      },
    });
  },
  setLastMessageId(activeConversation) {
    const appConfig = Store.state.app.appConfig;

    const client = Store.state.app.xmppClient;
    const authUser = Store.state.app.authUser;
    const startOfTime = new Date(1970, 0, 1).toISOString();

    client.mam.query(authUser.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, {
      with: activeConversation.contact.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      start: startOfTime,
      end: new Date().toISOString(),
      max: 1,
      isGroup: false,
      onMessage: function(message) {
        const resultId = message.getElementsByTagName('result')[0].getAttribute('id');
        activeConversation.oldConversation.lastMessageId = resultId;
        return true;
      },
      onComplete: function() {
        return true;
      },
    });
  }
};
