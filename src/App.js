import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { HelmetProvider } from 'react-helmet-async'

/* Custom Components */
import NavBar from './components/navbar/navbar'

/* Page Components */
import HomePage from './components/home/home'
import VideosPage from './components/videos/videos'
import VideoPage from './components/video/video'
import StarPage from './components/star/star'
import VideoSearchPage from './components/search/videosearch'
import StarSearchPage from './components/search/starsearch'

import EditorPage from './components/editor/editor'
import ErrorPage from './components/404/404'

/* Style */
import './components/styles/main.scss'
import './components/styles/flag.scss'

class App extends Component {
    render() {
        return (
            <HelmetProvider>
            <Router>
                <NavBar />

                <main className='container-fluid'>
                    <div className='row'>
                        <Switch>
                            <Route path='/videos/search' component={VideoSearchPage} />

                            <Route path='/videos/add'>
                                <p>Add Videos Page</p>
                            </Route>

                            <Route path='/videos' component={VideosPage} />
                            <Route path='/video/:id' component={VideoPage} />

                            <Route path='/stars/search' component={StarSearchPage} />

                            <Route path='/star/:id' component={StarPage} />

                                <Route path='/editor' component={EditorPage} />

                            <Route path='/generate/thumbnails'>
                                <h1>Generate Thumbnails Page</h1>
                            </Route>

                            <Route path='/generate/vtt'>
                                <h1>VTT Page</h1>
                            </Route>

                            <Route path='/settings'>
                                <h1>Settings Page</h1>
                            </Route>

                                <Route path='/' exact component={HomePage} />

                                <Route path='*' component={ErrorPage} />
                        </Switch>
                    </div>
                </main>
            </Router>
            </HelmetProvider>
        )
    }
}

export default App
