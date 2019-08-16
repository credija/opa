import * as types from './mutation-types';

const actions = {
  // Global App States
  updateIsAppLoading({ commit }, isAppLoading) {
    commit(types.UPDATE_IS_APP_LOADING, {
      isAppLoading
    });
  },
  updateAppConfig({ commit }, appConfig) {
    commit(types.UPDATE_APP_CONFIG, {
      appConfig
    });
  },
  updateAppLocale({ commit }, appLocale) {
    commit(types.UPDATE_APP_LOCALE, {
      appLocale
    });
  },
  updateShowUsersWithoutGroups({ commit }, showUsersWithoutGroups) {
    commit(types.UPDATE_SHOW_USERS_WITHOUT_GROUPS, {
      showUsersWithoutGroups
    });
  },

  updateIsLogging({ commit }, isLogging) {
    commit(types.UPDATE_IS_LOGGING, {
      isLogging
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
  updateChatTimestamp({ commit }, chatTimestamp) {
    commit(types.UPDATE_CHAT_TIMESTAMP, {
      chatTimestamp
    });
  },

  // Auth User
  updateAuthUser({ commit }, authUser) {
    commit(types.UPDATE_AUTH_USER, {
      authUser
    });
  },
  updateAuthUserPresence({ commit }, presence) {
    commit(types.UPDATE_AUTH_USER_PRESENCE, {
      presence
    });
  },
  updateAuthUserImageBin({ commit }, updateAuthUserImageBin) {
    const { authUser, type, bin } = updateAuthUserImageBin;
    commit(types.UPDATE_AUTH_USER_IMAGE_BIN, { authUser, type, bin });
  },

  // Roster List
  updateRosterList({ commit }, rosterList) {
    commit(types.UPDATE_ROSTER_LIST, {
      rosterList
    });
  },
  updateRosterObj({ commit }, rosterObjects) {
    const { oldRosterObj, newRosterObj } = rosterObjects;
    commit(types.UPDATE_ROSTER_OBJ, { oldRosterObj, newRosterObj });
  },
  updatePresenceRosterContact({ commit }, updatePresenceRosterContact) {
    const { rosterObj, presence } = updatePresenceRosterContact;
    commit(types.UPDATE_PRESENCE_ROSTER_CONTACT, { rosterObj, presence });
  },
  updateStatusRosterContact({ commit }, updateStatusRosterContact) {
    const { rosterObj, status } = updateStatusRosterContact;
    commit(types.UPDATE_STATUS_ROSTER_CONTACT, {
      rosterObj,
      status
    });
  },
  addToRosterList({ commit }, rosterObj) {
    commit(types.ADD_TO_ROSTER_LIST, rosterObj);
  },
  updateIsLoadingRoster({ commit }, bol) {
    commit(types.UPDATE_IS_LOADING_ROSTER, bol);
  },

  // Profile Image
  updateProfileImageList({ commit }, profileImageList) {
    commit(types.UPDATE_PROFILE_IMAGE_LIST, {
      profileImageList
    });
  },
  updateProfileImageBin({ commit }, updateProfileImageBin) {
    const { profileImage, type, bin } = updateProfileImageBin;
    commit(types.UPDATE_PROFILE_IMAGE_BIN, { profileImage, type, bin });
  },
  updateProfileImageHash({ commit }, updateProfileImageHash) {
    const { profileImage, hash } = updateProfileImageHash;
    commit(types.UPDATE_PROFILE_IMAGE_HASH, { profileImage, hash });
  },
  addProfileImageToList({ commit }, profileImage) {
    commit(types.ADD_PROFILE_IMAGE_TO_LIST, { profileImage });
  },
  removeProfileImageFromList({ commit }, profileImage) {
    commit(types.REMOVE_PROFILE_IMAGE_FROM_LIST, {
      profileImage
    });
  }
};

export default actions;
