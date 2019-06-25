import XmppService from '@/services/xmpp-service';
import NotificationService from '@/services/notification-service';
import FaviconService from '@/services/favicon-service';
import DocTitleService from '@/services/doc-title-service';
import PresenceEnum from '@/enums/presence-enum';
import StringUtils from '@/utils/string-utils';
import ObjectUtils from '@/utils/object-utils';
import CacheUtils from '@/utils/cache-utils';
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
        this.store.dispatch('chat/updateDelayIncomingMessages', true);
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
    let rosterList = this.store.state.app.rosterList;

    const rosterContacts = iq.getElementsByTagName('item');
    if (iq.query !== null) {
      for (let i = 0; i < rosterContacts.length; i++) {
        const rosterObj = {};
        const group = rosterContacts[i].getElementsByTagName('group')[0];
        rosterObj.username = StringUtils.removeAfterInclChar(
          rosterContacts[i].getAttribute('jid'),
          '@'
        );

        const cachedRosterObj = rosterList.find(
          cachedRosterObj =>
            cachedRosterObj.username.toUpperCase() ===
            rosterObj.username.toUpperCase()
        );

        if (rosterObj.username !== this.store.state.app.authUser.username) {
          rosterObj.name =
            rosterContacts[i].getAttribute('name') !== null
              ? rosterContacts[i].getAttribute('name')
              : rosterObj.username;
          rosterObj.status = '';
          rosterObj.presence = { id: 'off', value: 'Offline' };
          rosterObj.group = group.childNodes[0].nodeValue;

          if (cachedRosterObj !== undefined) {
            this.store.dispatch('app/updateRosterObj', {
              oldRosterObj: cachedRosterObj,
              newRosterObj: rosterObj
            });
          } else {
            rosterList.push(rosterObj);
            this.store.dispatch('app/updateRosterList', rosterList);
            XmppService.updateContactPresence(rosterObj);
          }
        }
      }

      rosterList.sort(function(obj1, obj2) {
        const textA = obj1.name.toUpperCase();
        const textB = obj2.name.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      const cachedRosterList = JSON.parse(JSON.stringify(rosterList));
      cachedRosterList.forEach(function(roster) {
        roster.presence = { id: 'off', value: 'Offline' };
      });

      localStorage.setItem(
        btoa(`cached-roster-${this.store.state.app.authUser.username}`),
        btoa(JSON.stringify(cachedRosterList))
      );
    }

    this.store.dispatch('app/updateIsLoadingRoster', false);
  },
  presenceHandler(presence) {
    const appConfig = this.store.state.app.appConfig;
    const client = this.store.state.app.xmppClient;
    const rosterList = this.store.state.app.rosterList;
    const authUser = this.store.state.app.authUser.username;

    const show = presence.getElementsByTagName('show')[0];
    const status = presence.getElementsByTagName('status')[0];
    const type = presence.getAttribute('type');
    const from = StringUtils.removeAfterInclChar(
      presence.getAttribute('from'),
      '@'
    );
    const rosterObj = rosterList.find(
      roster => roster.username.toUpperCase() === from.toUpperCase()
    );

    if (rosterList.length === 0 || from === authUser) {
      return true;
    }

    XmppService.profileImageService(presence);

    if (show !== undefined) {
      const showValue = show.textContent;

      this.store.dispatch('app/updatePresenceRosterContact', {
        rosterObj: rosterObj,
        presence: PresenceEnum.getPresenceById(showValue)
      });
    } else if (type === 'unavailable' || type === 'error') {
      if (this.store.state.chat.activeConversation !== null) {
        this.store.dispatch('chat/updateActiveConversationIsTyping', false);
      }

      this.store.dispatch('app/updatePresenceRosterContact', {
        rosterObj: rosterObj,
        presence: { id: 'off', value: 'Offline' }
      });
      setTimeout(function() {
        const check = $pres({
          type: 'probe',
          to: rosterObj.username + `@${appConfig.XMPP_SERVER_DOMAIN}`
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
    const composing = msg.getElementsByTagName('composing')[0];
    const paused = msg.getElementsByTagName('paused')[0];

    if (this.store.state.chat.delayIncomingMessages) {
      this.store.dispatch('chat/addMessageToDelayedList', msg);
      return true;
    }

    let conversation = conversationList.find(
      conversationFind =>
        conversationFind.contact.username.toUpperCase() === from.toUpperCase()
    );

    if (fromAttr === 'chat') {
      const msgContent = MessageParser.parseAdminMessage(body.textContent);
      let newDate = new Date();

      if (stamp !== undefined) newDate = new Date(stamp.textContent);

      MessageBox.alert(
        `${newDate.toLocaleString(locale)}:<br> ` +
          `<p style="word-wrap: break-word !important; white-space: pre-wrap !important;">${msgContent}</p>`,
        context.translation.t('chat.adminMessageTitle'),
        {
          showClose: false,
          dangerouslyUseHTMLString: true,
          confirmButtonText: 'OK'
        }
      );
      return true;
    } else if (type === 'chat' && body !== undefined) {
      const msgContent = body.textContent;
      let newDate = new Date();
      if (stamp !== undefined) newDate = new Date(stamp.textContent);

      if (conversation !== undefined) {
        if (
          conversation.contact.username ===
          ObjectUtils.getValidUsername(
            () => activeConversation.contact.username
          )
        ) {
          conversation.numUnreadMsgs = 0;
        } else if (conversation.numUnreadMsgs < 99) {
          conversation.numUnreadMsgs += 1;

          if (conversation.numUnreadMsgs === 1) {
            const numUnreadConversation = this.store.state.chat
              .numUnreadConversation;
            this.store.dispatch(
              'chat/updateNumUnreadConversation',
              numUnreadConversation + 1
            );
            FaviconService.constructor(this.store).updateFavicon();
            DocTitleService.constructor(this.store).updateTitle();
          }
        }

        this.store.dispatch('chat/addMessageToConversation', {
          conversation: conversation,
          messageToAdd: {
            msg: msgContent,
            ownMessage: false,
            from,
            stampDate: newDate
          }
        });
      } else {
        let rosterObj = rosterList.find(
          roster => roster.username.toUpperCase() === from.toUpperCase()
        );
        if (rosterObj === undefined) {
          rosterObj = {};
          rosterObj.username = from;
          rosterObj.name = from;
          rosterObj.status = '';
          rosterObj.presence = { id: 'off', value: 'Offline' };
          rosterObj.group = 'UNKNOWN';
          this.store.dispatch('app/addToRosterList', rosterObj);
          XmppService.updateContactPresence(rosterObj);
        }

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
          conversation: conversation,
          messageToAdd: {
            msg: msgContent,
            ownMessage: false,
            from,
            stampDate: newDate
          }
        });

        newDate.setSeconds(newDate.getSeconds() - 5);
        this.store.dispatch('chat/updateOldConversationLastStamp', {
          oldConversation: conversation.oldConversation,
          lastStamp: newDate.toISOString()
        });

        this.store.dispatch('chat/addConversationToList', conversation);

        if (
          conversation.contact.username ===
          ObjectUtils.getValidUsername(
            () => activeConversation.contact.username
          )
        ) {
          this.store.dispatch(
            'chat/clearUnreadCounterConversation',
            conversation
          );
          this.store.dispatch('chat/updateOldConversation', {
            conversation: conversation,
            oldConversation: activeConversation.oldConversation
          });
          this.store.dispatch('chat/updateActiveConversation', conversation);
        } else {
          const numUnreadConversation = this.store.state.chat
            .numUnreadConversation;
          this.store.dispatch(
            'chat/updateNumUnreadConversation',
            numUnreadConversation + 1
          );
          FaviconService.constructor(this.store).updateFavicon();
          DocTitleService.constructor(this.store).updateTitle();
        }
      }

      if (!bolFirstConversation) {
        this.store.dispatch(
          'chat/reorderConversationByConversation',
          conversation
        );
      }

      CacheUtils.saveConversationList(
        this.store.state.app.authUser.username,
        this.store.state.chat.conversationList
      );

      const ctx = this;
      setTimeout(function() {
        const messageBoxDoc = document.getElementById('message-box');
        if (messageBoxDoc) messageBoxDoc.scrollTop = messageBoxDoc.scrollHeight;
        NotificationService.constructor(ctx.store).sendAudioNotification();
        NotificationService.constructor(ctx.store).sendDesktopNotification(
          conversation.contact.name,
          msgContent
        );
        ctx.store.dispatch('chat/updateLastNotification', new Date());
      });
    } else if (
      composing !== undefined &&
      from ===
        ObjectUtils.getValidUsername(() => activeConversation.contact.username)
    ) {
      this.store.dispatch('chat/updateActiveConversationIsTyping', true);
    } else if (
      paused !== undefined &&
      from ===
        ObjectUtils.getValidUsername(() => activeConversation.contact.username)
    ) {
      this.store.dispatch('chat/updateActiveConversationIsTyping', false);
    }

    return true;
  },
  avatarCallback(iq) {
    let profileImageList = this.store.state.app.profileImageList;

    const from = StringUtils.removeAfterInclChar(iq.getAttribute('from'), '@');
    const vCardElement = iq.getElementsByTagName('vCard')[0];
    const photoTag = vCardElement.getElementsByTagName('PHOTO')[0];

    let profileImageObj = profileImageList.find(
      profileImage => profileImage.username.toUpperCase() === from.toUpperCase()
    );

    if (profileImageObj === undefined) {
      profileImageObj = {
        username: from,
        hash: null,
        type: null,
        bin: null
      };
      this.store.dispatch('app/addProfileImageToList', profileImageObj);
    }

    let photoType;
    let photoBin;
    if (photoTag !== undefined) {
      photoType = photoTag.getElementsByTagName('TYPE')[0].textContent;
      photoBin = photoTag.getElementsByTagName('BINVAL')[0].textContent;
      if (photoBin !== profileImageObj.bin) {
        this.store.dispatch('app/updateProfileImageBin', {
          profileImage: profileImageObj,
          type: photoType,
          bin: photoBin
        });
      }
    } else {
      this.store.dispatch('app/updateProfileImageBin', {
        profileImage: profileImageObj,
        type: undefined,
        bin: undefined
      });
    }

    // Saves in LocalStorage for better caching
    profileImageList = this.store.state.app.profileImageList;
    localStorage.setItem(
      btoa(`cached-avatars-${this.store.state.app.authUser.username}`),
      btoa(JSON.stringify(profileImageList))
    );
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
        bin: photoBin
      });
    }
  }
};
