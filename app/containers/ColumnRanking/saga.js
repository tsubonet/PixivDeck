// @flow
import { union } from 'lodash'
import { addColumn } from 'containers/ColumnManager/actions'
import { getRequest } from 'services/api'
import * as Actions from './constants'
import * as actions from './actions'
import type { Mode } from './reducer'
import { makeSelectColumn, makeSelectModes } from './selectors'
import { put, select, call, takeEvery } from 'redux-saga/effects'

function* addRankingColumn({ mode }: { mode: Mode }) {
  const modes: Array<?Mode> = yield select(makeSelectModes())
  if (modes.every(v => v !== mode)) {
    yield put(actions.addRankingColumnSuccess(mode))
  }

  yield put(addColumn(`ranking-${mode}`, { columnId: mode, type: 'RANKING' }))
}

type Props = { id: Mode }

function* fetchRanking(props: Props) {
  const { id } = props

  try {
    const { illustIds } = yield select(makeSelectColumn(), props)

    const response = yield call(getRequest, `/v1/illust/ranking?mode=${id}`)
    const { result } = response

    yield put(actions.setNextUrl(id, result.nextUrl))

    const nextIds = union(illustIds, result.illusts)
    yield put(actions.fetchRankingSuccess(id, response, nextIds))
  } catch (err) {
    yield put(actions.fetchRankingFailre(id))
  }
}

function* fetchNextRanking(props: Props) {
  const { id } = props

  try {
    const { illustIds, nextUrl } = yield select(makeSelectColumn(), props)
    if (!nextUrl) {
      return
    }

    const response = yield call(getRequest, nextUrl)
    const { result } = response

    yield put(actions.setNextUrl(id, result.nextUrl))

    const nextIds = union(illustIds, result.illusts)
    yield put(actions.fetchRankingSuccess(id, response, nextIds))
  } catch (err) {
    yield put(actions.fetchNextRankingFailre(id))
  }
}

export default function* root(): Generator<*, void, void> {
  yield takeEvery(Actions.ADD_RANKING_COLUMN, addRankingColumn)
  yield takeEvery(Actions.FETCH_RANKING, fetchRanking)
  yield takeEvery(Actions.FETCH_NEXT_RANKING, fetchNextRanking)
}
