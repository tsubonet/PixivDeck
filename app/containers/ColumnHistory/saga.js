// @flow
import { addColumn } from 'containers/ColumnManager/actions'
import * as Actions from './constants'
import * as actions from './actions'
import { put, takeEvery } from 'redux-saga/effects'
import { OPEN_ILLUST_VIEWER } from '../IllustPreview/constants'
import { OPEN_MANGA_PREVIEW } from '../MangaPreview/constants'

function* addHistoryColumn() {
  yield put(addColumn('HISTORY', { columnId: 'history', type: 'HISTORY' }))
}

function* addHistory({ id }) {
  yield put(actions.addHistory(id))
}

export default function* root(): Generator<*, void, void> {
  yield takeEvery(Actions.ADD_COLUMN_HISTORY, addHistoryColumn)

  yield takeEvery(OPEN_ILLUST_VIEWER, addHistory)
  yield takeEvery(OPEN_MANGA_PREVIEW, addHistory)
}
