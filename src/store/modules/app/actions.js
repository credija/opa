import * as types from '../../mutation-types';

const actions = {
  updateAppLocale({ commit }, appLocale) {
    commit(types.UPDATE_APP_LOCALE, {
      appLocale
    });
  },
  updateAppConfig({ commit }, appConfig) {
    commit(types.UPDATE_APP_CONFIG, {
      appConfig
    });
  },
  updateIsLogging({ commit }, isLogging) {
    commit(types.UPDATE_IS_LOGGING, {
      isLogging
    });
  },
  updateIsChatReady({ commit }, isChatReady) {
    commit(types.UPDATE_IS_CHAT_READY, {
      isChatReady
    });
  },
  updateIsDisconnected({ commit }, isDisconnected) {
    commit(types.UPDATE_IS_DISCONNECTED, {
      isDisconnected
    });
  },
  updateXmppClient({ commit }, xmppClient) {
    commit(types.UPDATE_XMPP_CLIENT, {
      xmppClient
    });
  },
  updateAuthUser({ commit }, authUser) {
    commit(types.UPDATE_AUTH_USER, {
      authUser
    });
  },
  updateRosterList({ commit }, rosterList) {
    commit(types.UPDATE_ROSTER_LIST, {
      rosterList
    });
  },
  updateRosterFirstLoad({ commit }, rosterFirstLoad) {
    commit(types.UPDATE_ROSTER_FIRST_LOAD, {
      rosterFirstLoad
    });
  },
  updateProfileImageList({ commit }, profileImageList) {
    commit(types.UPDATE_PROFILE_IMAGE_LIST, {
      profileImageList
    });
  },
  updateChatTimestamp({ commit }, chatTimestamp) {
    commit(types.UPDATE_CHAT_TIMESTAMP, {
      chatTimestamp
    });
  },
};

export default actions;
