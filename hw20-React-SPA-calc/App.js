import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Router, Route, Link, Switch} from 'react-router-dom'
import createHistory from "history/createBrowserHistory"

let Summ = p => {
  const n1 = +p.match.params.num1
  const n2 = +p.match.params.num2 || 0
  const summ = n1 + n2 || 'Нужно вводить числа'
  return (
    <div>{summ}</div>
  )
}

let Calc = p => {
  return (
    <div>Что считать?</div>
  )
}

let Content = p =>
<Router history = {createHistory()}>
  <Switch>
    <Route path = "/" component = {Calc} exact/>
    <Route path = "/:num1/:num2" component = {Summ}/>
    <Route path = "/:num1" component = {Summ}/>
  </Switch>
</Router>

function App() {
  return (
    <div className="App">
      <Content />
    </div>
  )
}

export default App;