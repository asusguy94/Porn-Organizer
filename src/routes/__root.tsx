import { Container, CssBaseline } from '@mui/material'

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ToastContainer } from 'react-toastify'

import NavBar from '@/components/navbar'

import '../index.css'
import 'react-toastify/dist/ReactToastify.min.css'

export const Route = createRootRoute({
  component: () => (
    <>
      <NavBar />

      <CssBaseline />
      <Container component='main' maxWidth={false}>
        <Outlet />
      </Container>

      <ToastContainer position='top-center' autoClose={5000} />
    </>
  )
})
