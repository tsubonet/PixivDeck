// @flow
import ms from 'ms'
import update from 'utils/update'
import { REHYDRATE } from 'redux-persist/constants'
import { handleRehydrate } from 'utils/handleReydrate'
import type { Action } from './actionTypes'
import * as Actions from './constants'

export type Restrict = 'public' | 'private'

export type Endpoint = '/v1/user/follows/illust'

export type ColumnId = Restrict

export type ColumnFollow = {|
  illustIds: Array<number>,
  nextUrl: ?string,
  interval: number,
|}

export type State = $Shape<{ [ColumnId]: ColumnFollow }>

const initialState: State = {}

export default function(state: State = initialState, action: Action): State {
  switch (action.type) {
    case Actions.ADD_FOLLOW_COLUMN_SUCCESS:
      return update(state, action, {
        illustIds: [],
        nextUrl: null,
        interval: ms('3m'),
      })
    case Actions.SET_NEXT_URL:
      return update(state, action, { nextUrl: action.nextUrl })

    case Actions.FETCH_FOLLOW_SUCCESS:
    case Actions.FETCH_NEXT_FOLLOW_SUCCESS:
    case Actions.FETCH_NEW_SUCCESS:
      return update(state, action, { illustIds: action.ids })

    case REHYDRATE:
      return handleRehydrate(state, action, 'ColumnFollow')
    default:
      return state
  }
}
