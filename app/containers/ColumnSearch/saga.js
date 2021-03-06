// @flow
import ms from 'ms'
import { delay } from 'redux-saga'
import { put, select, call, takeEvery } from 'redux-saga/effects'
import { union, difference } from 'lodash'
import { addColumn } from 'containers/ColumnManager/actions'
import { getToken } from 'containers/LoginModal/saga'
import { getRequest } from 'services/api'
import * as Actions from './constants'
import * as actions from './actions'
import type { ColumnId } from './reducer'
import * as selectors from './selectors'
import type { Action } from './actionTypes'
import { notifyWithIllust } from '../Notify/saga'

function* addSearchColumn({ id }: Action) {
  const ids: Array<?ColumnId> = yield select(selectors.makeSelectIds())
  if (ids.every(v => v !== id)) {
    yield put(actions.addColumnSuccess(id))
  }

  yield put(
    addColumn(`search-${id}`, {
      columnId: id,
      type: 'SEARCH',
    })
  )
}

function createEndpoint(id) {
  return `/v1/search/illust?word=${id}&search_target=partial_match_for_tags&sort=date_desc`
}

function* fetchSearch(action: Action): Generator<*, void, *> {
  const { id } = action
  try {
    const { illustIds, nextUrl } = yield select(
      selectors.makeSelectColumn(),
      action
    )
    const hasMore = yield select(selectors.makeSelectHasMore(), action)

    // nullのチェックではない
    if (hasMore === false) {
      return
    }

    const accessToken = yield call(getToken)

    const endpoint = nextUrl ? nextUrl : createEndpoint(id)

    const response = yield call(getRequest, endpoint, null, accessToken)
    const { result } = response

    yield put(actions.setNextUrl(id, result.nextUrl))
    const nextIds = union(illustIds, result.illusts)

    if (nextUrl) {
      yield put(actions.fetchNextSuccess(id, response, nextIds))
    } else {
      yield put(actions.fetchSuccess(id, response, nextIds))
    }
  } catch (err) {
    yield put(actions.fetchFailre(id, err))
  }
}

function* fetchUntilLimit(action: Action): Generator<*, void, *> {
  try {
    const initLen: number = yield select(selectors.makeIllustLength(), action)

    while (true) {
      yield call(fetchSearch, action)

      const len = yield select(selectors.makeIllustLength(), action)

      const nextUrl = yield select(selectors.makeSelectNextUrl(), action)

      if (!nextUrl) {
        return
      }

      // 新しく取得したイラスト数が10より少ない場合、データを再fetchする
      if (len - initLen > 10) {
        return
      }

      yield call(delay, 200)
    }
  } catch (err) {
    yield put(actions.fetchNewFailre(action.id, err))
  }
}

function* fetchNew(action: Action): Generator<*, void, *> {
  try {
    const { illustIds } = yield select(selectors.makeSelectColumn(), action)
    const beforeIds = yield select(
      selectors.makeLimitedSelectIllustsId(),
      action
    )

    const endpoint = createEndpoint(action.id)

    const accessToken = yield call(getToken)
    const response = yield call(getRequest, endpoint, null, accessToken)
    const { result } = response

    const nextIds = union(result.illusts, illustIds)
    yield put(actions.fetchNewSuccess(action.id, response, nextIds))

    const afterIds = yield select(
      selectors.makeLimitedSelectIllustsId(),
      action
    )

    const diffIllusts = difference(afterIds, beforeIds)
    if (diffIllusts.length > 0) {
      for (const illustId of diffIllusts) {
        yield call(notifyWithIllust, {
          title: `検索新着 ${action.id} イラスト`,
          id: illustId,
        })
      }
    }
  } catch (err) {
    yield put(actions.fetchNewFailre(action.id, err))
  }
}

// TODO キャンセル
function* fetchNewWatch(action: Action) {
  try {
    while (true) {
      yield call(fetchNew, action)
      const { interval } = yield select(selectors.makeSelectColumn(), action)
      yield delay(interval)
    }
  } catch (err) {
    // TODO エラーハンドリング
    console.log(err)
  }
}

export default function* root(): Generator<*, void, void> {
  yield takeEvery(Actions.ADD_COLUMN, addSearchColumn)

  yield takeEvery(Actions.FETCH, fetchUntilLimit)
  yield takeEvery(Actions.FETCH_NEXT, fetchUntilLimit)
  yield takeEvery(Actions.SET_MIN_BOOKBOOK, fetchUntilLimit)

  yield takeEvery(Actions.FETCH_SUCCESS, fetchNewWatch)
  yield takeEvery(Actions.FETCH_NEW, fetchNewWatch)
}
