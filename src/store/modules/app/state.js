const state = {
  appLocale: 'en-us',
  appConfig: null,
  isLogging: false,
  isChatReady: false,
  isDisconnected: false,
  xmppClient: null,
  authUser: '',
  rosterList: [],
  rosterFirstLoad: true,
  profileImageList: [],
  chatTimestamp: Date.now(),
};

export default state;
