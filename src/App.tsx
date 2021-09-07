import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { Container, CssBaseline } from '@material-ui/core'

/* Custom Components */
import NavBar from './components/navbar/navbar'

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
				<Switch>
					<Route path='/video/add' component={AddVideoPage} />
					<Route path='/video/search' component={VideoSearchPage} />
					<Route path='/video/:id' component={VideoPage} />
					<Route path='/video' component={VideosPage} />

					<Route path='/star/search' component={StarSearchPage} />
					<Route path='/star/:id' component={StarPage} />
					<Route path='/star' component={StarsPage} />

					<Route path='/editor' component={EditorPage} />

					<Route path='/' exact component={HomePage} />
					<Route path='*' component={ErrorPage} />
				</Switch>
			</Container>
		</CssBaseline>
	</Router>
)

export default App
