export default {
  getSizeChat() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1900) {
      return {
        offsetAlert: 2,
        sizeAlert: 20,

        offsetSideMenu: 2,
        sizeSideMenu: 6,

        offsetChatbox: 0,
        sizeChatbox: 14,
      };
    } else if (screenWidth >= 1600) {
      return {
        offsetAlert: 1,
        sizeAlert: 22,

        offsetSideMenu: 1,
        sizeSideMenu: 7,

        offsetChatbox: 0,
        sizeChatbox: 15,
      };
    } else if (screenWidth < 1400) {
      return {
        offsetAlert: 0,
        sizeAlert: 24,

        offsetSideMenu: 0,
        sizeSideMenu: 8,

        offsetChatbox: 0,
        sizeChatbox: 16,
      };
    }
    return window.innerWidth;
  },
};
