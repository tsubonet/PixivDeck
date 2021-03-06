// @flow
import { createSelector, createStructuredSelector } from 'reselect'
import type { State } from 'types/state'

const selectAuth = (state: State) => state.LoginModal

export const makeSelectUsername = () =>
  createSelector(selectAuth, s => s.username)

export const makeSelectPassword = () =>
  createSelector(selectAuth, s => s.password)

export const makeSelectInfo = () =>
  createStructuredSelector({
    username: makeSelectUsername(),
    password: makeSelectPassword(),
  })

export const makeSelectIsLoading = () =>
  createSelector(selectAuth, s => s.isLoading)

export const makeSelectIsLoginFailure = () =>
  createSelector(selectAuth, s => s.isLoginFailure)
