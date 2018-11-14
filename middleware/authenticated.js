export default function ({ store, redirect }) {
  if (store.state.app.xmppClient === null) {
    return redirect('/?loginExpired=true')
  }
}
