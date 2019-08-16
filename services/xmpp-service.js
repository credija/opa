import XmppUtils from '@/utils/xmpp-utils';
import { Strophe, $iq, $pres, $msg } from 'strophe.js';
import StringUtils from '@/utils/string-utils';
import FormatUtils from '@/utils/format-utils';
import CacheUtils from '@/utils/cache-utils';
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
    if (!usernameCred.includes(`@${appConfig.XMPP_SERVER_DOMAIN}`)) {
      usernameCred += `@${appConfig.XMPP_SERVER_DOMAIN}`;
    }

    const connUrl = appConfig.XMPP_SERVER_ADDRESS;
    conn = new Strophe.Connection(connUrl);
    this.store.dispatch('app/updateXmppClient', conn);

    conn.connect(usernameCred, password, XmppUtils.onConnect.bind(this));
  },

  getRoster() {
    let setAppLoading = true;
    const cachedRoster = localStorage.getItem(
      btoa(`cached-roster-${this.store.state.app.authUser.username}`)
    );
    if (cachedRoster !== null) {
      const parsedCachedRoster = JSON.parse(atob(cachedRoster));
      this.store.dispatch('app/updateRosterList', parsedCachedRoster);
      const ctx = this;
      this.store.state.app.rosterList.forEach(function(rosterObj) {
        ctx.updateContactPresence(rosterObj);
      });
      setAppLoading = false;
      CacheUtils.loadConversationList(
        this.store.state.app.authUser.username,
        parsedCachedRoster,
        this.store
      );
    } else {
      this.store.dispatch('chat/updateDelayIncomingMessages', false);
    }

    const cachedAvatars = localStorage.getItem(
      btoa(`cached-avatars-${this.store.state.app.authUser.username}`)
    );
    if (cachedAvatars !== null) {
      this.store.dispatch(
        'app/updateProfileImageList',
        JSON.parse(atob(cachedAvatars))
      );
    }

    const client = this.store.state.app.xmppClient;
    const iq = $iq({
      type: 'get'
    }).c('query', {
      xmlns: 'jabber:iq:roster'
    });

    this.translation = this.i18n;

    client.sendIQ(iq, XmppUtils.rosterCallback.bind(this));
    client.addHandler(XmppUtils.presenceHandler.bind(this), null, 'presence');
    client.addHandler(
      XmppUtils.messageHandler.bind(this),
      null,
      'message',
      null,
      null,
      null
    );
    client.send($pres());
    this.store.dispatch('chat/updateLastPresence', 'on');

    const ctx = this;
    if (setAppLoading) {
      setTimeout(function() {
        ctx.store.dispatch('app/updateIsAppLoading', false);
      }, 3000);
    }
  },

  updateContactPresence(contact) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

    const check = $pres({
      type: 'probe',
      to: contact.username + `@${appConfig.XMPP_SERVER_DOMAIN}`
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
        to: rosterList[i].username + `@${appConfig.XMPP_SERVER_DOMAIN}`
      });
      client.send(check);
    }
  },

  sendMessage(msg, to, date) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

    const m = $msg({
      to: to + `@${appConfig.XMPP_SERVER_DOMAIN}`,
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
      to: jid + `@${appConfig.XMPP_SERVER_DOMAIN}`,
      type: 'chat'
    }).c(notification, { xmlns: Strophe.NS.CHATSTATES });

    client.send(chatSignal);
  },
  profileImageService(presence) {
    const profileImageList = this.store.state.app.profileImageList;

    const from = StringUtils.removeAfterInclChar(
      presence.getAttribute('from'),
      '@'
    );
    const photo = presence.getElementsByTagName('x')[0];
    let photoUpdate = null;
    if (photo !== undefined) {
      photoUpdate = photo.getElementsByTagName('photo')[0].textContent;
    }

    let profileImageObj = profileImageList.find(
      profileImage => profileImage.username.toUpperCase() === from.toUpperCase()
    );
    if (profileImageObj === undefined && photoUpdate !== 'photo-deleted') {
      this.updateUserAvatar(from);
    } else if (photoUpdate === 'photo-deleted') {
      this.store.dispatch('app/removeProfileImageFromList', profileImageObj);
    } else if (photoUpdate !== profileImageObj.hash) {
      this.store.dispatch('app/updateProfileImageHash', {
        profileImage: profileImageObj,
        hash: photoUpdate
      });
      this.updateUserAvatar(profileImageObj.username);
    }
  },
  updateUserAvatar(username) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;

    const avatarIq = $iq({
      type: 'get',
      to: username + `@${appConfig.XMPP_SERVER_DOMAIN}`
    }).c('vCard', { xmlns: 'vcard-temp' });
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
      to: clientUsername + `@${appConfig.XMPP_SERVER_DOMAIN}`
    }).c('vCard', { xmlns: 'vcard-temp' });
    client.sendIQ(avatarIq, XmppUtils.vCardLoggedUser.bind(this));
  },

  sendChangePresenceSignal(presence) {
    const client = this.store.state.app.xmppClient;
    let presenceSignal = {};

    if (presence === 'on') {
      presenceSignal = $pres();
    } else {
      presenceSignal = $pres()
        .c('show')
        .t(presence);
      // TODO: Presence config per user                   .up().c('priority').t(127);
    }

    client.send(presenceSignal);
  },

  updateProfileImage(profileImage) {
    const client = this.store.state.app.xmppClient;
    const authUser = this.store.state.app.authUser;

    FormatUtils.getBase64FromFile(profileImage).then(base64File => {
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
        bin: base64File
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
      bin: undefined
    });

    const updateAvatarPres = $pres()
      .c('x', { xmlns: 'vcard-temp:x:update' })
      .c('photo', {}, 'photo-deleted')
      .up()
      .c('show')
      .t(authUser.presence.id);
    client.send(updateAvatarPres);
  },

  getOldMessages(conversation, bolOpenConversation) {
    return new Promise((resolve, reject) => {
      const ctx = this;

      const appConfig = this.store.state.app.appConfig;
      const client = this.store.state.app.xmppClient;
      const authUser = this.store.state.app.authUser;

      let messageBox = document.getElementById('message-box');
      let scrollHeight = null;
      if (messageBox) {
        scrollHeight = messageBox.scrollHeight;
      }

      const startOfTime = new Date(1970, 0, 1).toISOString();

      if (
        Number(conversation.oldConversation.lastRetrievedId) ===
          Number(conversation.oldConversation.lastMessageId) ||
        conversation.oldConversation.lastMessageId === -1
      ) {
        setTimeout(() => {
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

      let messageList = [];
      const resultIdList = [];

      client.mam.query(authUser.username + `@${appConfig.XMPP_SERVER_DOMAIN}`, {
        with:
          conversation.contact.username + `@${appConfig.XMPP_SERVER_DOMAIN}`,
        start: startOfTime,
        end: conversation.oldConversation.lastStamp,
        before: conversation.oldConversation.lastRetrievedId,
        max: 15,
        isGroup: false,
        onMessage: function(message) {
          const resultId = message
            .getElementsByTagName('result')[0]
            .getAttribute('id');
          const stamp = message.getElementsByTagName('stamp')[0];
          const delay = message.getElementsByTagName('delay')[0];

          const messageBody = message.getElementsByTagName('body')[0]
            .textContent;
          const from = StringUtils.removeAfterInclChar(
            message.getElementsByTagName('message')[0].getAttribute('from'),
            '@'
          );

          let unformattedDate;

          if (stamp !== undefined)
            unformattedDate = new Date(stamp.textContent);
          else if (delay !== undefined)
            unformattedDate = new Date(delay.getAttribute('stamp'));

          let ownMessage = false;
          if (from === authUser.username) {
            ownMessage = true;
          }
          messageList.push({
            msg: messageBody,
            ownMessage,
            from,
            stampDate: unformattedDate
          });

          resultIdList.push(resultId);

          return true;
        },
        onComplete: function(response) {
          const firstIdNode = response.getElementsByTagName('first')[0];
          let resultId = null;
          let foundIndex = 0;
          if (firstIdNode !== undefined) {
            resultId = firstIdNode.textContent;
            foundIndex = resultIdList.indexOf(resultId);
          }

          messageList = messageList.slice(foundIndex, messageList.length);

          ctx.store.dispatch('chat/updateOldConversationLastRetrievedId', {
            oldConversation: conversation.oldConversation,
            lastRetrievedId: resultId
          });

          if (messageList.length === 0) {
            ctx.store.dispatch('chat/updateOldConversationNoResult', {
              oldConversation: conversation.oldConversation,
              bool: true
            });
          } else {
            for (let index = 0; index < messageList.length; index++) {
              ctx.store.dispatch('chat/addMessageToConversation', {
                conversation: conversation,
                messageToAdd: messageList[index]
              });
            }
          }

          setTimeout(function() {
            if (bolOpenConversation) {
              messageBox = document.getElementById('message-box');
              messageBox.scrollTop = messageBox.scrollHeight;
            } else {
              messageBox.scrollTop = messageBox.scrollHeight - scrollHeight;
            }
          });
          resolve(messageList);
        }
      });
    });
  },

  setLastMessageId(conversation) {
    return new Promise((resolve, reject) => {
      const ctx = this;

      const appConfig = this.store.state.app.appConfig;
      const client = this.store.state.app.xmppClient;
      const authUser = this.store.state.app.authUser;

      const startOfTime = new Date(1970, 0, 1).toISOString();

      client.mam.query(authUser.username + `@${appConfig.XMPP_SERVER_DOMAIN}`, {
        with:
          conversation.contact.username + `@${appConfig.XMPP_SERVER_DOMAIN}`,
        start: startOfTime,
        end: new Date().toISOString(),
        max: 1,
        isGroup: false,
        onMessage: function() {
          return true;
        },
        onComplete: function(response) {
          const firstIdNode = response.getElementsByTagName('first')[0];
          let resultId = -1;
          if (firstIdNode !== undefined) {
            resultId = firstIdNode.textContent;
          } else {
            ctx.store.dispatch('chat/updateOldConversationNoResult', {
              oldConversation: conversation.oldConversation,
              bool: true
            });
          }
          ctx.store.dispatch('chat/updateOldConversationLastMessageId', {
            oldConversation: conversation.oldConversation,
            lastMessageId: resultId
          });
          resolve(firstIdNode);
        }
      });
    });
  }
};
