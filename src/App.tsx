import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Container, CssBaseline } from '@mui/material'

/* Custom Components */
import NavBar from '@components/navbar/navbar'

/* Page Components */
import HomePage from '@pages/home/home'
import VideosPage from '@pages/video/videos'
import VideoPage from '@pages/video/video'
import AddVideoPage from '@pages/video/add'
import StarsPage from '@pages/star/stars'
import StarPage from '@pages/star/star'
import VideoSearchPage from '@pages/search/videosearch'
import StarSearchPage from '@pages/search/starsearch'

import EditorPage from '@pages/editor/editor'

import ErrorPage from '@pages/404/404'

/* Style */
import '@styles/main.scss'
import '@styles/flag.scss'

const App = () => (
	<Router>
		<CssBaseline>
			<NavBar />

			<Container component='main' maxWidth={false}>
				<Routes>
					<Route path='video'>
						<Route path='add' element={<AddVideoPage />} />
						<Route path='search' element={<VideoSearchPage />} />
						<Route path=':id' element={<VideoPage />} />
						<Route path='' element={<VideosPage />} />
					</Route>

					<Route path='star'>
						<Route path='search' element={<StarSearchPage />} />
						<Route path=':id' element={<StarPage />} />
						<Route path='' element={<StarsPage />} />
					</Route>

					<Route path='/editor' element={<EditorPage />} />

					<Route path='/' element={<HomePage />} />
					<Route path='*' element={<ErrorPage />} />
				</Routes>
			</Container>
		</CssBaseline>
	</Router>
)

export default App
