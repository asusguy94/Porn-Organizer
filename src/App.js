import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

/* Custom Components */
import NavBar from './components/navbar/navbar'

/* Page Components */
import HomePage from './components/home/home'
import VideosPage from './components/video/videos'
import VideoPage from './components/video/video'
import AddVideoPage from './components/video/add'
import StarsPage from './components/star/stars'
import StarPage from './components/star/star'
import VideoSearchPage from './components/search/videosearch'
import StarSearchPage from './components/search/starsearch'

import EditorPage from './components/editor/editor'
import ErrorPage from './components/404/404'

/* Style */
import './components/styles/main.scss'
import './components/styles/flag.scss'

const App = () => (
	<Router>
		<NavBar />

		<main className='container-fluid'>
			<div className='row'>
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
			</div>
		</main>
	</Router>
)

export default App
