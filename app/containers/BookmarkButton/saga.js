// @flow
// eslint-disable-next-line import/order
import { select, call, put, takeEvery, type IOEffect } from 'redux-saga/effects'
import { postRequest, fetchAuth } from '../../api/client'
import { makeSelectInfo } from '../LoginModal/selectors'
import * as Actions from './constants'
import * as actions from './actions'
import type { Restrict } from './types'

type Props = {
  id: number,
  restrict: Restrict,
}

function* bookmark({ id, restrict }: Props) {
  try {
    const info = yield select(makeSelectInfo())

    const { accessToken } = yield call(fetchAuth, info)

    yield call(
      postRequest,
      '/v2/illust/bookmark/add',
      { illustId: id, restrict },
      accessToken
    )

    yield put(actions.addBookmarkSuccess(id))
    // TODO Boxの情報を更新し表示をフォロー状態にする
  } catch (err) {
    yield put(actions.addBookmarkFailer(id, err))
  }
}

function* root(): Generator<IOEffect, void, *> {
  yield takeEvery(Actions.ADD_BOOKMARK_REQUEST, bookmark)
}

export default root
