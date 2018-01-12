import { h, render, Component } from 'preact';
import camelCase from "lodash/camelcase";
import {
  HashRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import css from './main.css';
import posts from './posts.json';
import image from './me.png';

import * as mdPosts from './md';

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
      <div id="content" className="flushLeft">
        <h2>Hi, I'm Bryan. I'm a Ruby engineer at 
          <a target="_blank" href="https://www.librato.com">Librato</a>
        </h2>
        <div id="posts">
          {posts.length > 0 ? <p>Recent Posts</p> : <p>Blog coming in 2018</p>}
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
        <img src={image}/>
        <p>Hey! My name is Bryan Mikaelian. I am a native Texan who has recently found his way to Maryland. I've been working in Software for about 10 years. You can usually find me on Twitter rambling about whatever. I'm also trying to blog more.</p>
        <p>I am a Ruby developer at heart but I've been working on some pretty cool <a target="_blank" href="https://www.appoptics.com/">stuff</a> using React and GraphQL. I am also a fan of monitoring all the things and finding ways we can make monitoring less terrible.</p>
        <p>When I'm not coding, I enjoy spending time with wife, eating at new restaurants, cooking at home, wasting way too much time on video <a href="https://worldofwarcraft.com/en-us/character/thrall/cynndrae" target="_blank">games</a>, and working in the yard</p>
      </div>
    </div>
  )
}

const Posts = () => {
  return (
    <div>
      <div id="content" className="flushLeft">
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

const Post = ({match}) => {
  const { params } = match;
  const { id } = params;
  const postId = camelCase(id);
  const post = mdPosts[postId];
  return (
    <div>
      <Nav />
      <div id="content" className="markdown" dangerouslySetInnerHTML={{__html: post}}>
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
          <Route exact path="/posts" component={Posts}/>
          <Route path="/posts/:id" component={Post}/>
        </div>
      </Router>
    )
  }
}

render(<App />, document.querySelector('#main'));

