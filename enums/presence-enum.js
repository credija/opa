export default {
  getPresenceEnum() {
    const PresenceEnum = [
      { id: 'away', value: 'Away' },
      { id: 'chat', value: 'Online' },
      { id: 'dnd', value: 'Busy' },
      { id: 'xa', value: 'Away Extended' },
      { id: 'on', value: 'Online' }
    ];
    return PresenceEnum;
  },
  getPresenceEnumUser() {
    const PresenceEnum = [
      { id: 'on', value: 'Online' },
      { id: 'dnd', value: 'Busy' },
      { id: 'away', value: 'Away' }
    ];
    return PresenceEnum;
  },
  getPresenceColor() {
    const PresenceColorEnum = [
      { id: 'away', value: 'text-away' },
      { id: 'chat', value: 'text-teal-clean' },
      { id: 'dnd', value: 'text-danger' },
      { id: 'xa', value: 'text-away' },
      { id: 'on', value: 'text-teal-clean' },
      { id: 'off', value: 'text-light-gray' }
    ];
    return PresenceColorEnum;
  },
  getPresenceBorderColor() {
    const PresenceColorEnum = [
      { id: 'away', value: 'b-away' },
      { id: 'chat', value: 'b-teal-clean' },
      { id: 'dnd', value: 'b-danger' },
      { id: 'xa', value: 'b-away' },
      { id: 'on', value: 'b-teal-clean' },
      { id: 'off', value: 'b-light-gray' }
    ];
    return PresenceColorEnum;
  },
  getPresenceById(idPresence) {
    return this.getPresenceEnum().find(presence => presence.id === idPresence);
  },
  getIconColor(idPresence) {
    return this.getPresenceColor().find(presence => presence.id === idPresence);
  },
  getBorderColor(idPresence) {
    return this.getPresenceBorderColor().find(
      presence => presence.id === idPresence
    );
  }
};
