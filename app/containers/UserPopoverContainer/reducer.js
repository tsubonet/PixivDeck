// @flow
import type { Action } from './actionTypes'
import * as Actions from './constants'

export type State = {
  illusts: Array<number>,
}

const initialState: State = {
  illusts: [],
}

export default function(state: State = initialState, action: Action): State {
  switch (action.type) {
    case Actions.POPOVER_SUCCESS:
      return { illusts: action.illusts }
    case Actions.CLEAR:
      return { illusts: [] }
    default:
      return state
  }
}
