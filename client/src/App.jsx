// import { useContext, useState } from "react";
import "./App.css";
import axios from "axios";
import {  UserContextProvider } from "./UserContext";
import Routters from "./Routers";

function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  
  return (
    <UserContextProvider>
      <Routters/>
    </UserContextProvider>
  );
}

export default App;
