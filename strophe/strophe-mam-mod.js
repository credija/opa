/* eslint-disable */
import { Strophe, $iq } from 'strophe.js';

Strophe.addConnectionPlugin('mam', {
  _c: null,
  _p: ['with', 'start', 'end'],
  init: function(conn) {
    this._c = conn;
    Strophe.addNamespace('MAM', 'urn:xmpp:mam:1');
  },
  query: function(jid, options) {
    var _p = this._p;
    var attr = {
      type: 'set',
      to: jid
    };
    options = options || {};
    var mamAttr = { xmlns: Strophe.NS.MAM };
    if (!!options.queryid) {
      mamAttr.queryid = options.queryid;
      delete options.queryid;
    }
    var iq = $iq(attr)
      .c('query', mamAttr)
      .c('x', { xmlns: 'jabber:x:data', type: 'submit' });

    iq.c('field', { var: 'FORM_TYPE', type: 'hidden' })
      .c('value')
      .t(Strophe.NS.MAM)
      .up()
      .up();
    var i;
    for (i = 0; i < this._p.length; i++) {
      var pn = _p[i];
      var p = options[pn];
      delete options[pn];
      if (!!p) {
        iq.c('field', { var: pn })
          .c('value')
          .t(p)
          .up()
          .up();
      }
    }
    iq.up();

    var onMessage = options.onMessage;
    delete options.onMessage;
    var onComplete = options.onComplete;
    delete options.onComplete;

    iq.cnode(new Strophe.RSM(options).toXML());
    var _c = this._c;
    var handler = _c.addHandler(onMessage, Strophe.NS.MAM, 'message', null);
    return this._c.sendIQ(iq, function() {
      _c.deleteHandler(handler);
      onComplete.apply(this, arguments);
    });
  }
});
