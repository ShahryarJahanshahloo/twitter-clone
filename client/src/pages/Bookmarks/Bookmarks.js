// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Avatar from '../../components/Avatar/Avatar'
import List from '../../components/List/List'
import TopBar from '../../components/TopBar/TopBar'
import useTweetList from '../../hooks/useTweetList'

const Bookmarks = props => {
  const history = useHistory()
  const isLoggedIn = useSelector(state => state.loginStatusReducer)
  const username = useSelector(state => state.userReducer.username)

  if (!isLoggedIn) {
    history.push('/login')
  }

  const [tweets, loadMore] = useTweetList('/api/bookmarks', {})

  return (
    <>
      <TopBar
        desktop
        Left={<Avatar username={username} size='32' wrap />}
        Middle={<div className='title-box'>Bookmarks</div>}
      />
      <List
        tweets={tweets}
        alt={{
          big: 'You haven’t added any Tweets to your Bookmarks yet',
          small: 'When you do, they’ll show up here.',
        }}
      />
      {tweets.length < 10 ? null : (
        <button className='load-more' onClick={loadMore}>
          load more tweets
        </button>
      )}
    </>
  )
}

export default Bookmarks
