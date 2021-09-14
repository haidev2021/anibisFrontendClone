import React from 'react';
import logo from './logo.svg';
import './App.css';
import Root from './root/root';
import { BrowserRouter, HashRouter, Route, Link, Switch } from "react-router-dom";
function App() {
  return (
    <div className="App">
        <Root></Root>
    </div>
  );
}

export default App;
