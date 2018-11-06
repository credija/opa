import { Strophe } from 'strophe.js';
 
// Rewrite to save KeepAlive in LocalStorage and not SessionStorage
Strophe.Bosh.prototype._buildBody = function() {
  const bodyWrap = new Strophe.Builder('body', {
    rid: this.rid++,
    xmlns: Strophe.NS.HTTPBIND
  });
  if (this.sid !== null) {
    bodyWrap.attrs({ sid: this.sid });
  }
  if (this._conn.options.keepalive && this._conn._sessionCachingSupported()) {
    if (this._conn.authenticated) {
      if (this._conn.jid && this.rid && this.sid) {
        window.localStorage.setItem('lsCreds', JSON.stringify({
          jid: this._conn.jid,
          rid: this.rid,
          sid: this.sid
        }));
      }
    } else {
      window.localStorage.removeItem('lsCreds');
    }
  }
  return bodyWrap;
};

Strophe.Bosh.prototype._restore = function (jid, callback, wait, hold, wind) {
  const session = JSON.parse(window.localStorage.getItem('lsCreds'));
  if (typeof session !== 'undefined' &&
             session !== null &&
             session.rid &&
             session.sid &&
             session.jid &&
             (typeof jid === 'undefined' ||
                  jid === null ||
                  Strophe.getBareJidFromJid(session.jid) === Strophe.getBareJidFromJid(jid) ||
                 ((Strophe.getNodeFromJid(jid) === null) 
                 && (Strophe.getDomainFromJid(session.jid) === jid)))
  ) {
    this._conn.restored = true;
    this._attach(session.jid, session.sid, session.rid, callback, wait, hold, wind);
  } else {
    throw { name: 'StropheSessionError', message: '_restore: no restoreable session.' };
  }
};
 
export default Strophe;
