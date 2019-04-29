import XmppUtils from '@/utils/xmpp-utils';
import { Strophe, $iq, $pres, $msg } from 'strophe.js';
import StringUtils from '@/utils/string-utils';
import FormatUtils from '@/utils/format-utils';
import 'strophejs-plugin-rsm';
import '@/strophe/strophe-mam-mod';

export default {
  constructor(store, i18n) {
    this.store = store;
    this.i18n = i18n;
    return this;
  },

  loginXmpp(username, password) {
    const appConfig = this.store.state.app.appConfig;

    let conn = null;
    let usernameCred = username.toLowerCase();
    if (!usernameCred.includes(`@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`)) {
      usernameCred += `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`;
    }

    const connUrl = appConfig.VUE_APP_XMPP_SERVER_ADDRESS;
    conn = new Strophe.Connection(connUrl);
    this.store.dispatch('app/updateXmppClient', conn);
    
    conn.connect(usernameCred, password, XmppUtils.onConnect.bind(this));
  },

  getRoster() {
    const cachedRoster = localStorage.getItem(btoa(`cached-roster-${this.store.state.app.authUser.username}`));
    if (cachedRoster !== null) {
      this.store.dispatch('app/updateRosterList', JSON.parse(atob(cachedRoster)));
      const ctx = this;
      this.store.state.app.rosterList.forEach(function(rosterObj){
        ctx.updateContactPresence(rosterObj);
      });
    }

    const cachedAvatars = localStorage.getItem(btoa(`cached-avatars-${this.store.state.app.authUser.username}`));
    if (cachedAvatars !== null) {
      this.store.dispatch('app/updateProfileImageList', JSON.parse(atob(cachedAvatars)));
    }

    const client = this.store.state.app.xmppClient;
    const iq = $iq({
      type: 'get'
    }).c('query', {
      xmlns: 'jabber:iq:roster'
    });

    client.sendIQ(iq, XmppUtils.rosterCallback.bind(this));
    client.addHandler(XmppUtils.presenceHandler.bind(this), null, 'presence');
    this.translation = this.i18n;
    client.addHandler(XmppUtils.messageHandler.bind(this), null, 'message', null, null, null);
    client.send($pres());
    this.store.dispatch('chat/updateLastPresence', 'on');

    
    const ctx = this;
    setTimeout(function () {
      ctx.store.dispatch('app/updateIsAppLoading', false);
    }, 1000);
  },

  updateContactPresence(contact) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;
    
    const check = $pres({
      type: 'probe',
      to: contact.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
    });
    client.send(check);
  },

  updateRosterPresence() {
    const appConfig = this.store.state.app.appConfig;
    const rosterList = this.store.state.app.rosterList;
    const client = this.store.state.app.xmppClient;
    
    for (let i = 0; i < rosterList.length; i++) {
      const check = $pres({
        type: 'probe',
        to: rosterList[i].username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      });
      client.send(check);
    }
  },

  sendMessage(msg, to, date) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

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
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

    const chatSignal = $msg({ 
      to: jid + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, 
      type: 'chat' 
    })
      .c(notification, { xmlns: Strophe.NS.CHATSTATES });

    client.send(chatSignal);
  },
  profileImageService(presence) {
    const profileImageList = this.store.state.app.profileImageList;

    const from = StringUtils.removeAfterInclChar(presence.getAttribute('from'), '@');
    const photo = presence.getElementsByTagName('x')[0];
    let photoUpdate = null;
    if (photo !== undefined) {
      photoUpdate = photo.getElementsByTagName('photo')[0].textContent;
    }

    let profileImageObj = profileImageList.find(profileImage => 
      profileImage.username.toUpperCase() === from.toUpperCase());
    if (profileImageObj === undefined && photoUpdate !== 'photo-deleted') {
      this.updateUserAvatar(from);
    } else if (photoUpdate === 'photo-deleted') {
      this.store.dispatch('app/removeProfileImageFromList', profileImageObj);
    } else if (photoUpdate !== profileImageObj.hash) {
      this.store.dispatch('app/updateProfileImageHash', { profileImage: profileImageObj, hash: photoUpdate });
      this.updateUserAvatar(profileImageObj.username);
    }
  },
  updateUserAvatar(username) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

    const avatarIq = $iq({ 
      type: 'get',
      to: username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}` 
    })
      .c('vCard', { xmlns: 'vcard-temp' });
    client.sendIQ(avatarIq, XmppUtils.avatarCallback.bind(this));
  },
  updateLoggedUserVcard() {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;
    const clientUsername = StringUtils.removeAfterInclChar(client.jid, '@');

    this.store.dispatch('app/updateAuthUser', { 
      username: clientUsername, 
      presence: { id: 'on', value: 'Online' }
    });

    const avatarIq = $iq({ 
      type: 'get',
      to: clientUsername + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}` 
    })
      .c('vCard', { xmlns: 'vcard-temp' });
    client.sendIQ(avatarIq, XmppUtils.vCardLoggedUser.bind(this));
  },

  sendChangePresenceSignal(presence) {
    const client = this.store.state.app.xmppClient;
    let presenceSignal = {};

    if (presence === 'on') {
      presenceSignal = $pres();
    } else {
      presenceSignal = $pres().c('show').t(presence);
    // TODO: Presence config per user                   .up().c('priority').t(127);
    }
    
    client.send(presenceSignal);
  },
  
  updateProfileImage(profileImage) {
    const client = this.store.state.app.xmppClient;
    const authUser = this.store.state.app.authUser;

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

        this.store.dispatch('app/updateAuthUserImageBin', { 
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
    const client = this.store.state.app.xmppClient;
    const authUser = this.store.state.app.authUser;

    const iq = $iq({ 
      type: 'set'
    })
      .c('vCard', { xmlns: 'vcard-temp' })
      .c('PHOTO')
      .c('TYPE', '')
      .up()
      .c('BINVAL', '');

    client.sendIQ(iq);

    this.store.dispatch('app/updateAuthUserImageBin', { 
      authUser: authUser, 
      type: undefined,
      bin: undefined, 
    });

    const updateAvatarPres = $pres()
      .c('x', { xmlns: 'vcard-temp:x:update' })
      .c('photo', {}, 'photo-deleted')
      .up()
      .c('show')
      .t(authUser.presence.id);
    client.send(updateAvatarPres);
  },

  getOldMessages(conversation) {
    const ctx = this;

    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;
    const authUser = this.store.state.app.authUser;

    const messageBox = document.getElementById('message-box');
    const scrollHeight = messageBox.scrollHeight;
    const startOfTime = new Date(1970, 0, 1).toISOString();

    if (Number(conversation.oldConversation.lastRetrievedId) 
      === Number(conversation.oldConversation.lastMessageId) 
    && Number(conversation.oldConversation.lastMessageId) !== 0) {
      this.store.dispatch('chat/updateOldConversationIsLoading', { 
        oldConversation: conversation.oldConversation, 
        bool: true 
      });
      setTimeout(() => {
        this.store.dispatch('chat/updateOldConversationIsLoading', { 
          oldConversation: conversation.oldConversation, 
          bool: false 
        });
        this.store.dispatch('chat/updateOldConversationNoResult', { 
          oldConversation: conversation.oldConversation, 
          bool: true 
        });
      }, 300);
      return;
    }

    if (conversation.oldConversation.lastStamp === null) {
      this.store.dispatch('chat/updateOldConversationLastStamp', { 
        oldConversation: conversation.oldConversation, 
        lastStamp: new Date().toISOString()
      });
    }

    this.store.dispatch('chat/updateOldConversationIsLoading', { 
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
        const resultId = message.getElementsByTagName('result')[0].getAttribute('id');
        const stamp = message.getElementsByTagName('delay')[0].getAttribute('stamp');
        const messageBody = message.getElementsByTagName('body')[0].textContent;
        const from = StringUtils
          .removeAfterInclChar(message.getElementsByTagName('message')[0].getAttribute('from'), '@');
        const unformattedDate = new Date(stamp);

        if (isFirstMessage) {
          ctx.store.dispatch('chat/updateOldConversationLastRetrievedId', { 
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
          msg: messageBody, 
          ownMessage, 
          stampDate: unformattedDate 
        });
        
        return true;
      },
      onComplete: function() {
        ctx.store.dispatch('chat/updateOldConversationIsLoading', { 
          oldConversation: conversation.oldConversation, 
          bool: false 
        });

        if (messageList.length === 0) {
          ctx.store.dispatch('chat/updateOldConversationNoResult', { 
            oldConversation: conversation.oldConversation, 
            bool: true 
          });
        } else {
          ctx.store.dispatch('chat/addMessageListToOldConversation', { 
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
    const ctx = this;

    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;
    const authUser = this.store.state.app.authUser;

    const startOfTime = new Date(1970, 0, 1).toISOString();

    client.mam.query(authUser.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`, {
      with: conversation.contact.username + `@${appConfig.VUE_APP_XMPP_SERVER_DOMAIN}`,
      start: startOfTime,
      end: new Date().toISOString(),
      max: 1,
      isGroup: false,
      onMessage: function(message) {
        const resultId = message.getElementsByTagName('result')[0].getAttribute('id');
        ctx.store.dispatch('chat/updateOldConversationLastMessageId', { 
          oldConversation: conversation.oldConversation, 
          lastMessageId: resultId 
        });
        return true;
      },
      onComplete: function() {
        return true;
      },
    });
  }
};
