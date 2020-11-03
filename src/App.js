import React, {Component} from 'react';
import './App.css';
import * as firebase from 'firebase';
import 'firebase/auth'

import {useAuthState} from 'react-firebase-hooks/auth'
import NewNote from './components/NewNote';
import Board from './components/Board'
import NewGroup from './components/NewGroup';
import BoardMenu from './components/BoardMenu'

const config = {
  apiKey: "AIzaSyBrIvaDrn3qjw6doqUlFPTdTPWpZvODRdE",
  authDomain: "lash-captionator.firebaseapp.com",
  databaseURL: "https://lash-captionator.firebaseio.com",
  projectId: "lash-captionator",
  storageBucket: "lash-captionator.appspot.com",
  messagingSenderId: "908555625261",
  appId: "1:908555625261:web:156e6d778cfbc502e8e9a4"
};

firebase.initializeApp(config);

const auth = firebase.auth()

function Authorize (){
  const [user] = useAuthState(auth);
  // console.log(user)
  return(
    <>
    {user ? <SignOut/> : <SignIn/>}
    </>
  )
}

///////////////////////////////////////////////////////
/// THE BULK OF THE ACTUAL INTERFACE WILL BE LOCATED IN HERE
/// *NOT* DIRECTLY IN THE RENDER FUNCTION OF THE APP CLASS
///////////////////////////////////////////////////////
function DelayRenderUntilLogin(){
  const [user] = useAuthState(auth);
  if(user){
    return (<main>
    <BoardMenu />
  </main> )
  } else {
    return <p>Login to begin</p>
  }
}

function SignIn(){
  const googleSignIn = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);

  }
  
  return(
    <button onClick={googleSignIn}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <>
    <h3>You are signed in as {auth.currentUser.displayName}</h3>
    <button onClick={()=>auth.signOut()}>Sign Out</button>
    </>
  )
}



class App extends Component {
  constructor(){
    super();
    this.state={
      speed: 10,
      boards:{}
    };
  }

  componentDidMount(){
    console.log("APP mounted")
 
    // this.getBoards();
  }

  render(){
    //display number
    const num = this.state.speed
    return (
      <>
      <div className="App">
       <h1>Captionator: The Hierarchial Moodboard</h1>
       <Authorize/>
        {/* Due to numerous hiccups in the component-did-mount functions of
        other components, it's essential that ALMOST NOTHING renders here UNTIL
        the page recognizes that a user has logged in */}
        <h2>Select Board</h2>
     
        <DelayRenderUntilLogin/>

      </div>
      </>
    );
  }
}

export default App;
