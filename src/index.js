import { h, render, Component } from 'preact';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import posts from './posts.json'

const Nav = () => {
  return (
    <div id="top">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <a target="_blank" href="https://github.com/bryanmikaelian">Code</a>
        <a target="_blank" href="https://twitter.com/bryanmikaelian">Twitter</a>
      </nav>
    </div>
  )
}

const Home = () => {
  return (
    <div>
      <Nav />
      <div id="content">
        <h2>Hi, I'm Bryan. I'm an engineer at 
          <a target="_blank" href="https://www.librato.com">Librato</a>
        </h2>
        {posts.length > 0 && <p>Recent Posts</p>}
        <div id="posts">
          {posts.map(post => {
            const { id, title } = post;
            const url = `/posts/${id}`
            return <Link id={id} to={url}>{title}</Link>
          })}
        </div>
      </div>
    </div>
  )
}

const About = () => {
  return (
    <div>
      <Nav />
      <div id="content">
      </div>
    </div>
  )
}

const Post = () => {
  return (
    <div>
      <Nav />
      <div id="content">
      </div>
    </div>
  )
}

class App extends Component {
  render() {
    return (
      <Router hashType="noslash">
        <div>
          <Route exact path="/" component={Home}/>
          <Route path="/about" component={About}/>
          <Route path="/posts/:id" component={Post}/>
        </div>
      </Router>
    )
  }
}

render(<App />, document.querySelector('#main'));

