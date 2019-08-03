import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Provider, connect}   from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';

import thunk from 'redux-thunk'

let chatReducer = (state, action) => {
  if(state === undefined){
    return {messages: [], mesId: ''}
  }
  if(action.type === 'CHAT_CLEAR' || action.type === 'CHATROOM_SET'){
    return {...state, messages: [], mesId: ''}
  }
  if(action.type === 'CHAT_MESSAGES'){
    if(action.status === 'RESOLVED'){
      let id = action.payload.length ? action.payload[action.payload.length - 1]._id : store.getState().mesId
      return {...state, messages: [...state.messages, ...action.payload], mesId: id}
    }
  }
  return state
}

let chatRooms = (state, action) => {
  if(state === undefined){
    return {chatRooms: []}
  }
  if(action.type === 'ROOMS'){
    if(action.status == 'RESOLVED'){
      return {...state, chatRooms: [...action.payload]}
    }
  }
  return state
}

let currentChatRoom = (state, action) => {
  if(state === undefined){
    return {...state, chatRoomId: ''}
  }
  if(action.type === 'CHATROOM_SET'){
    return {...state, chatRoomId: action.roomId}
  }
  return state
}

let newMessage = (state, action) => {
  if(state == undefined){
    return {status: '', newMes: {}}
  }
  if(action.type === 'MESSAGE_SENDING' || action.type === 'MESSAGE_SENT' || action.type === 'MESSAGE_FAIL'){
    return {...state, status: action.type}
  }
  if(action.type === 'MESSAGE_SENT'){
    return {...state, newMes: action.payload}
  }
  return state
}

const reducers = combineReducers({
  chat: chatReducer,
  chatRooms,
  currentChatRoom,
  newMessage
})

const store = createStore(reducers, applyMiddleware(thunk))

//store.subscribe(() => console.log("store",store.getState()))

const actionMessageSending = () => ({type: 'MESSAGE_SENDING', status: 'PENDING', payload: null, error: null})

const actionMessageSent    = payload => ({type: 'MESSAGE_SENT', status: 'RESOLVED', payload, error: null})

const actionMessageFail    = error => ({type: 'MESSAGE_FAIL', status: 'REJECTED', payload: null, error})

// const actionNewMessage = (promise) => {
//   const actionMessageSending = () => ({type: 'MESSAGE_SENDING', status: 'PENDING', payload: null, error: null})
//   const actionMessageSent    = payload => ({type: 'MESSAGE_SENT', status: 'RESOLVED', payload, error: null})
//   const actionMessageFail    = error => ({type: 'MESSAGE_FAIL', status: 'REJECTED', payload: null, error})
//   return async function (dispatch){
//     dispatch(actionMessageSending())
//     try {
//       dispatch(actionMessageSent(await promise.then(res => res.json())))
//     }
//     catch (error) {
//       dispatch(actionMessageFail(error))
//     }
//   }
// }

function promiseActionsMaker(name, type){
  const actionPending     = () => ({ type: type, name, status: 'PENDING', payload: null, error: null })
  const actionResolved    = payload => ({ type: type, name, status: 'RESOLVED', payload, error: null })
  const actionRejected    = error => ({ type: type, name, status: 'REJECTED', payload: null, error })

  // function actionPromiseThunk(){
  //     return async dispatch => {
  //         dispatch(actionPending())
  //         let data = await promise.catch(e => dispatch(actionRejected(e)))
  //         dispatch(actionResolved(data))
  //     }
  // }
  function actionFetch(promise){
    return async function (dispatch){
      dispatch(actionPending())
      try {
        dispatch(actionResolved(await promise.then(res => res.json())))
      }
      catch (e) {
        dispatch(actionRejected(e))
      }
    }
  }
  return actionFetch;
}

let actionChat = promiseActionsMaker('messages', 'CHAT_MESSAGES')

let actionChatRooms = promiseActionsMaker('chatRooms', 'ROOMS')

function actionCurrentRoom(data){
  return {type: 'CHATROOM_SET', roomId: data}
}

class ChatRooms extends React.Component{
  constructor(props){
    super(props)
    this.state = {newChat: '', rooms: []}
    this.getChatRooms = this.getChatRooms.bind(this)
    this.createNewChat = this.createNewChat.bind(this)
  }

  componentDidMount(){
    this.getChatRooms()
  }

  getChatRooms(){
    let rooms = []
    this.props.actionChatRooms(fetch('/chatRooms'))
    .then(() => {
      this.props.chatRooms.map(room => {
        rooms.push(<option roomid = {room._id}>{room.name}</option>)
      })
      this.setState({rooms: rooms})
      this.state.rooms.length && this.props.actionCurrentRoom(this.state.rooms[0].props.roomid) 
    })
  }

  createNewChat(){
    fetch('/createChat', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({name: this.state.newChat})
    })
    .then(() => {this.setState({newChat: ''})
      this.getChatRooms()
    })    
  }

  render(){ 
    return (
      <div className = "chatRooms">
        <input type = "text" value = {this.state.newChat} placeholder = "new chat"
          onChange = {evt => this.setState({newChat: evt.target.value})}
          onKeyPress = {evt => {
            if(evt.charCode == 13){
              this.createNewChat()
            }
          }} />
        <button onClick = {this.createNewChat}
          disabled = {!this.state.newChat ? 'disabled' : ''}>create Chat</button>
        {!!this.state.rooms.length &&
        <select onChange = {
          evt => (this.state.rooms.map(room => room.props.children == evt.target.value && this.props.actionCurrentRoom(room.props.roomid)))}>
          {this.state.rooms}
        </select>}
      </div>
    )
  }
}

class FormContainer extends React.Component{
  constructor(props){
    super(props)
    this.state = {nick: '', message: ''}
    console.log(props.chatRoomId)
    this.sendMessage = this.sendMessage.bind(this)
  }
/*
  sendMessage(){
    this.props.actionNewMessage(
    fetch('/message', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ ...this.state, chatRoomId: this.props.chatRoomId })
      }))
    .then(() => {
      let message = store.getState().newMessage.status == 'MESSAGE_SENT' ? '' : this.state.message
      this.setState({message: message})
    })
  }
*/
  sendMessage(){
    this.props.actionMessageSending()
    fetch('/message', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({...this.state, chatRoomId: this.props.chatRoomId})
    })
    .then(res => {
      if(res.status === 201)
        this.props.actionMessageSent(res)
      else
        this.props.actionMessageFail(res)
    })
    //.catch(err => (console.log("catch"),this.props.actionMessageFail(err)))
    .then(() => {
      let message = store.getState().newMessage.status === 'MESSAGE_SENT' ? '' : this.state.message
      this.setState({message: message})
    })
  }

  render(){
    return(
      <div className = "formContainer">
        <input id = "nickInput" type = "text" value = {this.state.nick} placeholder = "nick"
          disabled = {this.props.newMessage === 'MESSAGE_SENDING' ? 'disabled' : ''}
          onChange = {evt => this.setState({nick: evt.target.value})}/>
        <input id = "messageInput" type = "text" placeholder = "message" value = {this.state.message}
          style = {{'border-color': this.props.newMessage === 'MESSAGE_FAIL' ? 'red' : ''}}
          disabled = {this.props.newMessage === 'MESSAGE_SENDING' ? 'disabled' : ''}
          onChange = {evt => this.setState({message: evt.target.value})}
          onKeyPress = {evt => {
            if(evt.charCode == 13){
              this.sendMessage()
            }
          }}/>
        <button onClick = {this.sendMessage} disabled = {!(this.state.nick && this.state.message) ? 'disabled' : ''}>Send</button>
      </div>
    )
  }
}

let Message = (props) => {
  return(
    <div>
      <div>{props.date}</div>
      <div>{props.nick}</div>
      <div>{props.msg}</div>
    </div>
  )
}

let History = (props) => {
  return (
    <div className = "history">
      {props.children}
    </div>
  )
}

const Loading = p =>
<div className = "loading">Loading...
    {// <img src = "https://media0.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />
  }
</div>

class Chat extends React.Component {
  constructor(props){
    super(props)
    this.state = {chatRooms: this.props.chatRooms}
  }

  componentWillMount(){
    setInterval(() => {
      let params = new URLSearchParams()
      params.append('roomId', this.props.chatRoomId)
      params.append('id', this.props.mesId)
      !!this.props.chatRoomId && this.props.actionChat(fetch('/message/' + params.toString()))//'roomId='+store.getState().currentChatRoom.chatRoomId+'&id='+store.getState().chat.mesId))
    }, 2000)
  }

  render(){
    console.log('<Component /> Props: ',this.props)
    let messages = []
    this.props.messages.map(msg => {
      let timestamp = parseInt(msg["_id"].toString().substr(0,8), 16)*1000
      let time = new Date(timestamp)
      let date = time.toLocaleDateString()
      messages.push(<Message date = {date} nick = {msg.nick} msg = {msg.message}></Message>)
    })
    return (
      <div>      
        {!!this.props.chatRooms.length &&
        <div className = "chat">
          <FormContainer />
          <History>
            {messages}
          </History>
        </div>}
        {!messages.length && <Loading />}
      </div>
    )
  }
}

let mapStateToProps = state => ({
  messages: state.chat.messages,
  mesId: state.chat.mesId, 
  chatRooms: state.chatRooms.chatRooms,
  chatRoomId: state.currentChatRoom.chatRoomId,
  newMessage: state.newMessage.status
})

let mapDispatchToProps = {actionChat, actionChatRooms, actionCurrentRoom}

FormContainer = connect(mapStateToProps, {actionMessageSending, actionMessageSent, actionMessageFail})(FormContainer)

Chat = connect(mapStateToProps, mapDispatchToProps)(Chat)

ChatRooms = connect(mapStateToProps, mapDispatchToProps)(ChatRooms)

class App extends React.Component{
  render(){
    return(
      <Provider store = {store}>
        <ChatRooms />  
        <Chat />
      </Provider>
    )
  }
}

export default App;