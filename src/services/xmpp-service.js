import Store from '@store/vuex-instance';
import XmppUtils from '@utils/xmpp-utils';
import { Strophe, $iq, $pres, $msg } from 'strophe.js';
import StringUtils from '@utils/string-utils';
import FormatUtils from '@utils/format-utils';
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
      Store.dispatch('app/addProfileImageToList', { 
        username: from, 
        hash: photoId, 
        type: null, 
        bin: null 
      });
      XmppUtils.updateUserAvatar(from);
    } else if (profileImageObj.hash !== photoId) {
      if (photoId === null) {
        Store.dispatch('app/updateProfileImageHash', { 
          profileImage: profileImageObj, 
          hash: 'null_hash', 
        });
      } else {
        Store.dispatch('app/updateProfileImageHash', { 
          profileImage: profileImageObj, 
          hash: photoId, 
        });
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
      Store.dispatch('app/updateProfileImageBin', { 
        profileImage: profileImageObj, 
        type: photoType,
        bin: photoBin, 
      });
    } else {
      Store.dispatch('app/updateProfileImageBin', { 
        profileImage: profileImageObj, 
        type: undefined,
        bin: undefined, 
      });
    }
  },
  updateLoggedUserVcard() {
    const appConfig = Store.state.app.appConfig;
    const client = Store.state.app.xmppClient;

    const clientUsername = StringUtils.removeAfterInclChar(client.jid, '@');

    Store.dispatch('app/updateAuthUser', { 
      username: clientUsername, 
      presence: { id: 'on', value: 'Online' }
    });

    const avatarIq = $iq({ 
      type: 'get',
      to: clientUsername + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}` 
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

        Store.dispatch('app/updateAuthUserImageBin', { 
          authUser: authUser, 
          type: profileImage.type,
          bin: base64File, 
        });

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

    Store.dispatch('app/updateAuthUserImageBin', { 
      authUser: authUser, 
      type: undefined,
      bin: undefined, 
    });

    const updateAvatarPres = $pres()
      .c('x', { xmlns: 'vcard-temp:x:update' })
      .c('photo', {}, StringUtils.randomIdGenerator())
      .up()
      .c('show')
      .t(authUser.presence.id);
    client.send(updateAvatarPres);
  },
  getOldMessages(conversation) {
    const appConfig = Store.state.app.appConfig;
    const client = Store.state.app.xmppClient;
    const authUser = Store.state.app.authUser;

    const messageBox = document.getElementById('messageBox');
    const scrollHeight = messageBox.scrollHeight;
    const startOfTime = new Date(1970, 0, 1).toISOString();

    if (Number(conversation.oldConversation.lastRetrievedId) 
      === Number(conversation.oldConversation.lastMessageId) 
    && Number(conversation.oldConversation.lastMessageId) !== 0) {
      Store.dispatch('chat/updateOldConversationIsLoading', { 
        oldConversation: conversation.oldConversation, 
        bool: true 
      });
      setTimeout(() => {
        Store.dispatch('chat/updateOldConversationIsLoading', { 
          oldConversation: conversation.oldConversation, 
          bool: false 
        });
        Store.dispatch('chat/updateOldConversationNoResult', { 
          oldConversation: conversation.oldConversation, 
          bool: true 
        });
      }, 300);
      return;
    }

    if (conversation.oldConversation.lastStamp === null) {
      Store.dispatch('chat/updateOldConversationLastStamp', { 
        oldConversation: conversation.oldConversation, 
        lastStamp: new Date().toISOString()
      });
    }

    Store.dispatch('chat/updateOldConversationIsLoading', { 
      oldConversation: conversation.oldConversation, 
      bool: true 
    });

    let isFirstMessage = true;
    const messageList = [];
    
    client.mam.query(authUser.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, {
      with: conversation.contact.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      start: startOfTime,
      end: conversation.oldConversation.lastStamp,
      before: conversation.oldConversation.lastRetrievedId,
      max: 5,
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
          Store.dispatch('chat/updateOldConversationLastRetrievedId', { 
            oldConversation: conversation.oldConversation, 
            lastRetrievedId: resultId 
          });
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
        Store.dispatch('chat/updateOldConversationIsLoading', { 
          oldConversation: conversation.oldConversation, 
          bool: false 
        });

        if (messageList.length === 0) {
          Store.dispatch('chat/updateOldConversationNoResult', { 
            oldConversation: conversation.oldConversation, 
            bool: true 
          });
        } else {
          Store.dispatch('chat/addMessageListToOldConversation', { 
            oldConversation: conversation.oldConversation, 
            messageList: messageList 
          });
        }
        setTimeout(function () {
          if (messageBox !== undefined) {
            messageBox.scrollTop = messageBox.scrollHeight - scrollHeight;
          }
        });
      },
    });
  },
  setLastMessageId(conversation) {
    const appConfig = Store.state.app.appConfig;
    const client = Store.state.app.xmppClient;
    const authUser = Store.state.app.authUser;

    const startOfTime = new Date(1970, 0, 1).toISOString();

    client.mam.query(authUser.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, {
      with: conversation.contact.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      start: startOfTime,
      end: new Date().toISOString(),
      max: 1,
      isGroup: false,
      onMessage: function(message) {
        const resultId = message.getElementsByTagName('result')[0].getAttribute('id');
        Store.dispatch('chat/updateOldConversationLastMessageId', { 
          oldConversation: conversation.oldConversation, 
          lastRetrievedId: resultId 
        });
        return true;
      },
      onComplete: function() {
        return true;
      },
    });
  }
};
