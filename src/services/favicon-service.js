
import Store from '@store/vuex-instance';

export default {
  updateFavicon() {
    const numUnreadConversation = Store.state.chat.numUnreadConversation;
    const faviconObj = this.getFaviconByType(numUnreadConversation);
    const faviconOldLink = document.getElementById('favicon');
    const newFaviconLink = document.createElement('link');
    
    if (faviconOldLink) {
      faviconOldLink.id = 'favicon';
      faviconOldLink.rel = 'icon';
      faviconOldLink.type = 'image/png';
      faviconOldLink.href = faviconObj.path;
    } else {
      newFaviconLink.id = 'favicon';
      newFaviconLink.rel = 'icon';
      newFaviconLink.type = 'image/png';
      newFaviconLink.href = faviconObj.path;
      document.getElementsByTagName('head')[0].appendChild(newFaviconLink);
    }
  },
  faviconArray() {
    return [ 
      { id: 0, path: '/favicon/favicon-normal.png' },
      { id: 1, path: '/favicon/favicon-1.png' },
      { id: 2, path: '/favicon/favicon-2.png' },
      { id: 3, path: '/favicon/favicon-3.png' },
      { id: 4, path: '/favicon/favicon-4.png' },
      { id: 5, path: '/favicon/favicon-5.png' },
      { id: 6, path: '/favicon/favicon-6.png' },
      { id: 7, path: '/favicon/favicon-7.png' },
      { id: 8, path: '/favicon/favicon-8.png' },
      { id: 9, path: '/favicon/favicon-9.png' },
      { id: 10, path: '/favicon/favicon-9-plus.png' },
      { id: 11, path: '/favicon/favicon-bell.png' }
    ];
  },
  getFaviconById(idFavicon) {
    if (idFavicon > 9) {
      return this.faviconArray()[10];
    }
    return this.faviconArray().find(favicon => favicon.id === idFavicon);
  },
  getFaviconByType(idFavicon) {
    if (idFavicon > 0) {
      return this.faviconArray()[11];
    }
    return this.faviconArray()[0];
  },
};
