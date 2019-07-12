import React from 'react';
import logo from './logo.svg';
import './App.css';

class FormContainer extends React.Component{
  constructor(props){
    super(props);
    this.state = {nick: '', message: ''};

    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage(){
    fetch('/message', {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({nick: this.state.nick, message: this.state.message})
        })
        .then(res => {
          if(res.status == 201){
            this.setState({message: ''})
          }
        })
  }
  
  render(){
    return(
      <div className = "FormContainer">
        <input id="nickInput" type="text" value={this.state.nick} placeholder="nick"
          onChange={evt => this.setState({nick: evt.target.value})}/>
        <input id="messageInput" type="text" value={this.state.message} placeholder="message"
          onChange={evt => this.setState({message: evt.target.value})}
          onKeyPress={evt => {
            if(evt.charCode == 13){
              this.sendMessage();
            }
          }}/>
        <button onClick={this.sendMessage}>Send</button>
      </div>
    )
  }
}

let Message = ({msg}) => {
  let timestamp = parseInt(msg["_id"].toString().substr(0,8), 16)*1000;
  let time = new Date(timestamp);
  let date = time.toLocaleDateString();
  return(
    <div>
      <div>{date}</div>
      <div>{msg.nick}</div>
      <div>{msg.message}</div>
    </div>
  )
}

let History = ({msgs}) => {
  return (
    <div className = "Hist">
    {msgs.length == 0 ? <p>loading...</p> :
    msgs.map(msg => <Message msg={msg}/>)}
  </div>)
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {history: []};

    let mesId = '';
    setInterval(() => {
      fetch('/message/' + mesId)
      .then(res => res.json())
      .then(data => {
        if(data.length != 0){
          for(let i = 0; i < data.length; i++){
            this.setState({history: [...this.state.history, data[i]]})
            mesId = data[data.length - 1]["_id"];
          }
        }
      })
    }, 2000);
  }
  render(){
    return(
      <div className="Chat">
        <FormContainer/>
        <History msgs={this.state.history}></History>
      </div>
    )
  }
}

export default App;