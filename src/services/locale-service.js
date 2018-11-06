
/* eslint-disable */

import Store from '@store/vuex-instance';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import AxiosLocal from '@services/axios-local-service';

export const LocaleService = {
  getEnUsLocale() {
    return {
      'en-us': {
        login: {
          usernamePlaceholder: 'User',
          passwordPlaceholder: 'Password',
          loginButton: 'Sign In',
          isLoginExpired: 'Your session has expired, please sign in again.',
          isCredentialsInvalid: 'The username and / or password is incorrect.',
          isLogout: 'Session ended successfully!'
        },
        chat: {
          loadingMessages: 'Loading your messages, please wait...',
          isDisconnectedMsg: 'You have been disconnected from the chat because of connection problems, but you can still check your messages. ' +
          'To re-use the chat sign in again.',
          noOpenConversation: 'There is no open chat.',
          tipNewConversation: 'You can open a new chat by clicking the',
          noConversation: 'You do not have conversations yet',
          openNewConversation: 'Open New Chat',
          back: 'Go Back',
          searchPlaceholder: 'Search Contact',
          min3Characters: 'Please enter at least 3 characters.',
          noContactFound: 'No contacts found',
          adminMessageTitle: 'Admin Message'
        },
        contactDetails: {
          modalTitle: 'Contact Details',
          nameLabel: 'Name',
          groupLabel: 'Group'
        },
        chatbox: {
          messageRequired: 'You must enter a message.',
          chatboxPlaceholder: 'Enter your message',
          typingLabel: 'Typing...',
          loadOldMessages: 'Load old messages...',
          loadingOldMessages: 'Loading old messages...',
          oldMessagesLimit: 'You have reached the old message search limit',
          oldMessagesLabel: 'Mensagens Antigas...'
        },
        profile: {
          changePhoto: 'Change',
          busyPresence: 'Busy',
          awayPresence: 'Away',
          deleteAvatarTitle: 'Are you sure?',
          deleteAvatarBody: 'When you confirm the deletion of the photo you will be using the default photo.',
          cancelDeleteAvatar: 'Cancel',
          avatarExtensionInvalid: 'Image must be of .PNG or .JPG extension!',
          avatarSizeInvalid: 'Image must be less than 2MBs!',
          reLoginButton: 'Sign In Again',
          reLoginTitle: 'Are you sure?',
          reLoginBody: 'When you log in again you will lose access to active conversations!',
          cancelReLogin: 'Cancel'
        },
        config: {
          desktopNotifications: 'Desktop Notifications',
          enableSoundNotification: 'Enable Sound Notifications',
          disableSoundNotification: 'Disable Sound Notifications',
          enableOfflineContacts: 'Show Offline Contacts',
          disableOfflineContacts: 'Hide Offline Contacts',
          enableDarkMode: 'Enable Night Mode',
          disableDarkMode: 'Disable Night Mode'
        },
      }
    };
  },
  loadLanguageAsync() {
    const locale = Store.state.app.appConfig.VUE_APP_LOCALE;
    if (i18n.locale !== locale) {
      return AxiosLocal.getLocaleFile(locale).then(res => {
        i18n.setLocaleMessage(locale, res.data);
        i18n.locale = locale;
        Store.dispatch('app/updateAppLocale', locale);
        return locale;
      });
    }
    return Promise.resolve(locale);
  }
};

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en-us',
  fallbackLocale: 'en-us',
  messages: LocaleService.getEnUsLocale()
});
