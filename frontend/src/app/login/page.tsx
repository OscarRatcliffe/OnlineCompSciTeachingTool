'use client'
import styles from "./page.module.scss";
import axios from "axios";
import ErrorMsg from "../components/ErrorMsg";
import { useState, useEffect } from 'react';

export default function login() {

  const [errorText, setErrorText] = useState("Internal error")
  const [errorVisible, setErrorVisible] = useState(false)

  // Set error back to invisible after being shown
  useEffect(() => { //Run on page update

    if (errorVisible) {

      const timer = setTimeout(() => { //Wait before fade out

        setErrorVisible(false)
  
      }, 4000); //Wait until element has faded out
  
      return () => clearTimeout(timer);
    }

  }, [errorVisible]);

  function setCookie(name: string, value: string, days:number) {

    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
  
    let expires = "expires=" + date.toUTCString();
  
    document.cookie = `${name}=${value}; ${expires};path=/;`
  }
  
  function loginHandler(event: any){
  
      event.preventDefault(); //Stops deafult form behavior
      const formData = new FormData(event.currentTarget); //Get username and password data 
  
      const username = formData.get('username');
      const password = formData.get('password');
  
      if (username != null && password != null) {
  
        // Get request to backend
        axios.get("http://localhost:3000/login", {
          headers: {
            'username': username.toString(),
            'password': password.toString()
          }
        }).then(function(response) {  
  
          // Save cookie for session token
          setCookie("sessionID", response.data, 7)

          //Reroute user to dashboard
          window.location.href = "/"


        }).catch(function(error) { //Error handling

          switch(error.response.status) { //Switch instead of if to make adding codes easier down the line

            case 401:

              setErrorText("Incorect Username / Password");
              break;

            case 500:

              setErrorText("Internal server error")
              break;
              

            default:

              setErrorText(`Unexpected error - ${error.response.status}`)

          }

          setErrorVisible(true) //Show error message

        })
      }
      }

  return (
    <div className={styles.main}>

      {errorVisible && (

        <ErrorMsg
          key={errorVisible.toString()} //Force reloads element
          id="error"
          error={errorText}
        ></ErrorMsg>

      )}

      <div className={styles.login}>

        <h1 className={styles.LoginText}>KNICK KNACK</h1>

        <form onSubmit={loginHandler}>

          <input type="text" name="username" placeholder="Username"/>
          <input type="password" name="password" placeholder="Password"/>
          <input className={styles.button} type="submit" value="Login" />

          <p>If you don't have an account, please <a href="/signup">signup here</a></p>

        </form>

      </div>

    </div>
  );
}