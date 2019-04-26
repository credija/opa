import Vue from 'vue';
import * as types from './mutation-types';

const mutations = {
  // Global App States
  [types.UPDATE_IS_APP_LOADING](state, { isAppLoading }) {
    state.isAppLoading = isAppLoading;
  },
  [types.UPDATE_APP_LOCALE](state, { appLocale }) {
    state.appLocale = appLocale;
  },
  [types.UPDATE_APP_CONFIG](state, { appConfig }) {
    state.appConfig = appConfig;
  },
  [types.UPDATE_IS_LOGGING](state, { isLogging }) {
    state.isLogging = isLogging;
  },
  [types.UPDATE_IS_DISCONNECTED](state, { isDisconnected }) {
    state.isDisconnected = isDisconnected;
  },
  [types.UPDATE_XMPP_CLIENT](state, { xmppClient }) {
    state.xmppClient = xmppClient;
  },
  [types.UPDATE_CHAT_TIMESTAMP](state, { chatTimestamp }) {
    state.chatTimestamp = chatTimestamp;
  },

  // Auth User
  [types.UPDATE_AUTH_USER](state, { authUser }) {
    state.authUser = authUser;
  },
  [types.UPDATE_AUTH_USER_PRESENCE](state, { presence }) {
    state.authUser.presence = presence;
  },
  [types.UPDATE_AUTH_USER_IMAGE_BIN](state, { authUser, type, bin }) {
    Vue.set(authUser, 'photoType', type);
    Vue.set(authUser, 'photoBin', bin);
  },

  // Roster List
  [types.UPDATE_ROSTER_LIST](state, { rosterList }) {
    state.rosterList = rosterList;
  },
  [types.UPDATE_ROSTER_OBJ](state, { oldRosterObj, newRosterObj }) {
    Vue.set(oldRosterObj, 'username', newRosterObj.username);
    Vue.set(oldRosterObj, 'name', newRosterObj.name);
    Vue.set(oldRosterObj, 'status', newRosterObj.status);
    Vue.set(oldRosterObj, 'group', newRosterObj.group);
  },
  [types.UPDATE_PRESENCE_ROSTER_CONTACT](state, { rosterObj, presence }) {
    Vue.set(rosterObj, 'presence', presence);
  },
  [types.UPDATE_STATUS_ROSTER_CONTACT](state, { rosterObj, status }) {
    Vue.set(rosterObj, 'status', status);
  },
  [types.ADD_TO_ROSTER_LIST](state, rosterObj) {
    state.rosterList.push(rosterObj);
  },
  
  // Profile Image
  [types.UPDATE_PROFILE_IMAGE_LIST](state, { profileImageList }) {
    state.profileImageList = profileImageList;
  },
  [types.UPDATE_PROFILE_IMAGE_BIN](state, { profileImage, type, bin }) {
    Vue.set(profileImage, 'type', type);
    Vue.set(profileImage, 'bin', bin);
  },
  [types.UPDATE_PROFILE_IMAGE_HASH](state, { profileImage, hash }) {
    Vue.set(profileImage, 'hash', hash);
  },
  [types.ADD_PROFILE_IMAGE_TO_LIST](state, { profileImage }) {
    state.profileImageList.push(profileImage);
  },
  [types.REMOVE_PROFILE_IMAGE_FROM_LIST](state, { profileImage }) {
    const objIndex = state.profileImageList.findIndex(o => o.username === profileImage.username);

    if(objIndex > -1) {
      state.profileImageList = state.profileImageList.slice(objIndex, 1);
    }
  },
};

export default mutations;
