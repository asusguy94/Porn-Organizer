import React, {Component} from 'react'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"

/* Custom Components */
import NavBar from "./components/navbar"

/* Page Components */
import HomePage from "./components/pages/home"
import VideosPage from "./components/pages/videos"
//import VideoSearchPage from "./components/pages/videosearch"
import VideoPage from "./components/pages/video"

/* Style */
import "./components/styles/main.scss"

class App extends Component {
    render() {
        return (
            <Router>
                <NavBar/>

                <main className="container-fluid">
                    <div className="row">
                        <Switch>
                            <Route path="/videos/search">
                                <h1>Videos Search Page</h1>
                            </Route>

                            <Route path="/videos/add">
                                <p>Add Videos Page</p>
                            </Route>

                            <Route path="/videos" component={VideosPage}/>

                            <Route path="/video/:id" component={VideoPage}/>

                            <Route path="/stars/search">
                                <h1>Stars Search Page</h1>
                            </Route>

                            <Route path="/generate/thumbnails">
                                <h1>Generate Thumbnails Page</h1>
                            </Route>

                            <Route path="/generate/vtt">
                                <h1>VTT Page</h1>
                            </Route>

                            <Route path="/settings">
                                <h1>Settings Page</h1>
                            </Route>

                            <Route path="/" component={HomePage}/>
                        </Switch>
                    </div>
                </main>
            </Router>
        )
    }
}

export default App
