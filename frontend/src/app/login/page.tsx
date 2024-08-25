'use client'
import styles from "./page.module.scss";
import axios from "axios";
import ErrorMsg from "../components/ErrorMsg";
import { useState } from 'react';

export default function login() {

  const [errorText, seterrorText] = useState("Internal error")

  function setCookie(name: string, value: string, days:number) {

    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
  
    let expires = "expires=" + date.toUTCString();
  
    document.cookie = `${name}=${value}; ${expires};path=/;`
  }
  
  function loginHandler(event: any){
  
      event.preventDefault();
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
  
          if(response.status = 200) {
  
            // Save cookie for session token
            setCookie("sessionID", response.data, 7)
  
            //Reroute user to dashboard
            window.location.href = "/"
  
          } else if(response.status = 401) {
  
            seterrorText("Incorect Username / Password")
  
          } else {
  
            seterrorText(`Unexpected error - ${response.status}`)
  
          }
          
        })
  
      }
  
  }

  return (
    <div className={styles.main}>

      <ErrorMsg
        id="error"
        error={errorText}
      ></ErrorMsg>

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
