// @flow
import React from 'react'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import App from 'containers/App'
import Language from 'containers/Language'
import type { Store } from 'types'
import { translationMessages } from '../../i18n'

try {
  injectTapEventPlugin()
} catch (err) {}

type Props = {
  store: Store,
}

function Root({ store }: Props) {
  return (
    <Provider store={store}>
      <Language messages={translationMessages}>
        <MuiThemeProvider>
          <App />
        </MuiThemeProvider>
      </Language>
    </Provider>
  )
}

export default Root
