import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Router, Route, Link, Switch, Redirect} from 'react-router-dom';
import createHistory from "history/createBrowserHistory";

let Header = p =>
<header>
    Some Header
</header>

let Album = ({name, id, images}) =>
<div className="album">
    <Link to={`/${name}`}>
        <h2>{name}</h2>
    </Link>
</div>

let AlbumsTemplate = p => {
    let albums = [];
    for (let album of p.albums){
        albums.push(<Album name={album.name} id={album._id}/>)
    }
    return (
        <div className='albums' children={albums} >
            {albums}
            <Link to="/album/new">New...</Link><br />
            <Link to={{pathname: "/album/change", state: {linkState: p.albums}}}>Change...</Link>
            <Link to={{pathname: "/album/delete", state: {linkState: p.albums}}}>Delete...</Link>
        </div>
    )
}

class Gallery extends React.Component {
    constructor(props){
        super(props)

        this.state = {currentImageIndex: 0}
        this.nextImage = this.nextImage.bind(this)
        this.prevImage = this.prevImage.bind(this)
    }

    getDeltaFunction(delta){
        return (prevState,nv) => (nv = prevState.currentImageIndex + delta, 
            {currentImageIndex: nv >= this.props.images.length ? 0 : 
                                (nv < 0 ? this.props.images.length -1 : nv)})
    }

    nextImage(){
        debugger;
        this.setState(this.getDeltaFunction(1))
    }

    prevImage(){
        this.setState(this.getDeltaFunction(-1))
    }

    render(){
        return(
            <div className='gallery'>
                <img src={this.props.images[this.state.currentImageIndex]} 
                     onClick={this.nextImage} />
                <button onClick={this.prevImage}>Prev</button>
            </div>
        )
    }
}

let Page404 = () => <h1> 404 </h1> 

class GalleryPage extends React.Component {
    constructor(props){
        super(props)
        this.name = props.match.params.galleryName;

        this.state = {images: []}
    }

    async componentDidMount(){
        let images = await (await fetch("/" + this.name)).json()
        this.setState({images})
        console.log(this.state)
    }

    render(){
        return(
            this.state.images.length > 0 ?
            <Gallery name = {this.name} images = {this.state.images}/> :
            <Loading />
        )
    }
}

const Loading = p =>
<div>
    <img src="https://media0.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />
</div>


class Albums extends React.Component {
    constructor(props){
        super(props)

        this.state = {albums: []}
    }

    async componentDidMount(){
        let res = await fetch("/album/")
        let albums = await res.json()
        this.setState({albums})
    }

    render(){
        return (
            this.state.albums.length > 0 ? 
                <AlbumsTemplate albums={this.state.albums} /> :
                <Loading />            
        )
    }
}

class AlbumNew extends React.Component {
    state = {value: '', sent: false}
    handleSave = this.handleSave.bind(this)

    async handleSave(){
        let res = await fetch("/album/",
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({name: this.state.value})
        })
        let data = await res.json()
        if (data){
            this.setState({sent: true})
        }
    }

    render(){
        return (
            this.state.sent ? 
            <Redirect to="/" /> :
            <div>
                <h1>New Album</h1>
                <input value={this.state.value}
                    onChange={e => this.setState({value: e.target.value})}
                    placeholder="Name"
                    />
                <button disabled={!this.state.value} onClick={this.handleSave}>Save...</button>
            </div>
        )
    }
}

class AlbumChange extends React.Component {
    state = {value: '', newValue: '', sent: false}
    handleChange = this.handleChange.bind(this)
    albums = this.props.location.state.linkState

    async handleChange(){
        let id = ''
        this.albums.map(album => {if(album.name == this.state.value) id = album._id})
        if(id){
            let res = await fetch("/album/" + id,
            {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify({name: this.state.newValue})
            })
            let data = await res.json()
            if (data){
                this.setState({sent: true})
            }
        }
    }

    render(){
        return (
            this.state.sent ? 
            <Redirect to="/" /> :
            <div>
                <h1>Album</h1>
                <input value={this.state.value}
                    onChange={e => this.setState({value: e.target.value})}
                    placeholder="Name"
                    />
                <input value={this.state.newValue}
                    onChange={e => this.setState({newValue: e.target.value})}
                    placeholder="New Name"
                    />
                <button disabled={!this.state.value && !this.state.newValue} onClick={this.handleChange}>Change...</button>
            </div>
        )
    }
}

class AlbumDelete extends React.Component {
    state = {value: '', sent: false}
    handleDelete = this.handleDelete.bind(this)
    albums = this.props.location.state.linkState

    async handleDelete(){
        let id = ''
        this.albums.map(album => {if(album.name == this.state.value) id = album._id})
        if(id){
            let res = await fetch("/album/" + id,
            {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "DELETE",
                body: JSON.stringify({name: this.state.value})
            })
            let data = await res.json()
            if (data){
                this.setState({sent: true})
            }
        }
    }

    render(){
        return (
            this.state.sent ? 
            <Redirect to="/" /> :
            <div>
                <h1>Album</h1>
                <input value={this.state.value}
                    onChange={e => this.setState({value: e.target.value})}
                    placeholder="Name"
                    />
                <button disabled={!this.state.value} onClick={this.handleDelete}>Delete...</button>
            </div>
        )
    }
}

let Content = p =>{
    return(
    <Router history = {createHistory()}>
        <Switch>
            <Route path = "/" component = { Albums } exact />
            <Route path = "/album/new" component = {AlbumNew} exact />
            <Route path = "/album/change" component = {AlbumChange} exact />
            <Route path = "/album/delete" component = {AlbumDelete} exact />
            <Route path = "/:galleryName" component = { GalleryPage } />
            <Route component = { Page404 } />
        </Switch>
    </Router>)
}

let Footer = p =>
<footer>
    Some Footer
</footer>

function App(p) {
  return (
    <div className="App">
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

export default App;