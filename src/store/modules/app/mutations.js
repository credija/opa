import * as types from '../../mutation-types';

const mutations = {
  [types.UPDATE_APP_LOCALE](state, { appLocale }) {
    state.appLocale = appLocale;
  },
  [types.UPDATE_APP_CONFIG](state, { appConfig }) {
    state.appConfig = appConfig;
  },
  [types.UPDATE_IS_LOGGING](state, { isLogging }) {
    state.isLogging = isLogging;
  },
  [types.UPDATE_IS_CHAT_READY](state, { isChatReady }) {
    state.isChatReady = isChatReady;
  },
  [types.UPDATE_IS_DISCONNECTED](state, { isDisconnected }) {
    state.isDisconnected = isDisconnected;
  },
  [types.UPDATE_XMPP_CLIENT](state, { xmppClient }) {
    state.xmppClient = xmppClient;
  },
  [types.UPDATE_AUTH_USER](state, { authUser }) {
    state.authUser = authUser;
  },
  [types.UPDATE_ROSTER_LIST](state, { rosterList }) {
    state.rosterList = rosterList;
  },
  [types.UPDATE_ROSTER_FIRST_LOAD](state, { rosterFirstLoad }) {
    state.rosterFirstLoad = rosterFirstLoad;
  },
  [types.UPDATE_PROFILE_IMAGE_LIST](state, { profileImageList }) {
    state.profileImageList = profileImageList;
  },
  [types.UPDATE_CHAT_TIMESTAMP](state, { chatTimestamp }) {
    state.chatTimestamp = chatTimestamp;
  },
};

export default mutations;
