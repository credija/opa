export const state = () => ({
  isAppLoading: true,
  appConfig: null,
  appLocale: 'en-us',
  isLogging: false,
  isChatReady: false,
  isDisconnected: false,
  xmppClient: null,
  authUser: '',
  rosterList: [],
  rosterFirstLoad: true,
  profileImageList: [],
  chatTimestamp: Date.now(),
});

export default state;
