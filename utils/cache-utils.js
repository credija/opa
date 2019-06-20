
let XmppService, XmppUtils, DocTitleService, FaviconService = null;

export default {
  saveConversationList(username, conversationList) {
    const conversationListClone = Array.from(conversationList);
    const convListAux = [];
    for (let i = 0; i < conversationListClone.length; i++) {
        convListAux.push({ 
            contact: conversationListClone[i].contact, 
            list: [], 
            numUnreadMsgs: conversationListClone[i].numUnreadMsgs, 
            isTyping: false,
            chatboxState: conversationListClone[i].chatboxState,
            oldConversation: {
                lastStamp: null,
                isLoading: false,
                lastMessageId: '',
                lastRetrievedId: '',
                list: []
            }
        });
    }
    localStorage.setItem(btoa(`cached-conversation-list-${username}`), btoa(JSON.stringify(convListAux)));
  },
  loadConversationList(username, cachedRoster, store) {
    DocTitleService = require('@/services/doc-title-service').default.constructor(store);
    FaviconService = require('@/services/favicon-service').default.constructor(store);
    XmppService = require('@/services/xmpp-service').default.constructor(store);
    XmppUtils = require('@/utils/xmpp-utils').default.constructor(store);

    let cache = localStorage.getItem(btoa(`cached-conversation-list-${username}`));
    const conversationList = [];
    if (cache !== null) {
        cache = JSON.parse(atob(cache));
        for (let i = 0; i < cache.length; i++) {
            let contactRef = cachedRoster.find(roster => 
                roster.username.toUpperCase() === cache[i].contact.username.toUpperCase());
            if (contactRef !== undefined) {
                cache[i].contact = contactRef;
                conversationList.push(cache[i]);
            }
        }
    }
    
    const cachedConversationList = cache;
    const conversationListRes = [];
    store.dispatch('app/updateIsAppLoading', true);
    if (cachedConversationList !== null) {
        const recGetOldMessages = (i) => {
            if (cachedConversationList.length === i) {
                store.dispatch('chat/updateConversationList', conversationListRes);
                setTimeout(() => {
                    store.dispatch('app/updateIsAppLoading', false);
                    store.dispatch('chat/updateDelayIncomingMessages', false);
                    const delayedMessageList = store.state.chat.delayedMessageList;
                    delayedMessageList.forEach(function(msg){
                        XmppUtils.messageHandler(msg);
                    });
                    this.saveConversationList(store.state.app.authUser.username, store.state.chat.conversationList);
                }, 500);
                return;
            }

            store.dispatch('chat/updateLockAutoLoadOldMessages', true);
            XmppService.setLastMessageId(cachedConversationList[i])
            .then((res) => {
                if (res !== undefined) {
                    if(cachedConversationList[i].numUnreadMsgs !== 0) {
                        const numUnreadConversation = store.state.chat.numUnreadConversation;
                        store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation + 1);
                        DocTitleService.updateTitle();
                        FaviconService.updateFavicon();
                    }
                    conversationListRes.push(cachedConversationList[i]);
                return XmppService.getOldMessages(cachedConversationList[i]);
                } else {
                    return Promise.resolve([]);
                }
            })
            .then((res) => {
                if (res.length < 15) {
                XmppService.getOldMessages(cachedConversationList[i]);
                }
                return Promise.resolve(true);
            })
            .then((res) => {
                store.dispatch('chat/updateLockAutoLoadOldMessages', false);
                recGetOldMessages(i + 1);
            });
          };

          recGetOldMessages(0);
        } else {
            store.dispatch('chat/updateDelayIncomingMessages', false);
            store.dispatch('app/updateIsAppLoading', false);
            const delayedMessageList = store.state.chat.delayedMessageList;
            delayedMessageList.forEach(function(msg){
                XmppUtils.messageHandler(msg);
            });
            this.saveConversationList(store.state.app.authUser.username, store.state.chat.conversationList);
        }
    },
};