export const state = () => ({
  isAppLoading: true,
  appConfig: null,
  appLocale: 'en-us',
  showUsersWithoutGroups: true,
  isLogging: false,
  isDisconnected: false,
  xmppClient: null,
  authUser: '',
  rosterList: [],
  isLoadingRoster: true,
  profileImageList: [],
  chatTimestamp: Date.now()
});

export default state;
