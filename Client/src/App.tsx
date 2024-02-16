import React, { Suspense } from 'react'

import { Container, CssBaseline } from '@mui/material'

import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import NavBar from '@/components/navbar'

import 'react-toastify/dist/ReactToastify.min.css'

const HomePage = React.lazy(() => import('./pages/(home)/page'))
const EditorPage = React.lazy(() => import('./pages/editor/page'))
const SettingsPage = React.lazy(() => import('./pages/settings/page'))
const StarPage = React.lazy(() => import('./pages/star/[id]/page'))
const StarsPage = React.lazy(() => import('./pages/star/page'))
const StarSearchPage = React.lazy(() => import('./pages/star/search/page'))
const VideoPage = React.lazy(() => import('./pages/video/[id]/page'))
const AddVideoPage = React.lazy(() => import('./pages/video/add/page'))
const VideoSearchPage = React.lazy(() => import('./pages/video/search/page'))

export default function App() {
  return (
    <>
      <NavBar />

      <CssBaseline />
      <Container component='main' maxWidth={false}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/' Component={HomePage} />
            <Route path='/editor' Component={EditorPage} />
            <Route path='/settings' Component={SettingsPage} />
            <Route path='/star' Component={StarsPage} />
            <Route path='/star/search' Component={StarSearchPage} />
            <Route path='/star/:id' Component={StarPage} />
            <Route path='/video/search' Component={VideoSearchPage} />
            <Route path='/video/add' Component={AddVideoPage} />
            <Route path='/video/:id' Component={VideoPage} />
          </Routes>
        </Suspense>
      </Container>

      <ToastContainer position='top-center' autoClose={5000} draggable={false} />
    </>
  )
}
