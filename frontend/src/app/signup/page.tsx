'use client'
import styles from "./page.module.scss";
import axios from "axios";
import ErrorMsg from "../components/ErrorMsg";
import { useState, useEffect } from 'react';

export default function signup() {

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
  
  function signupHandler(event: any){
  
      event.preventDefault(); //Stops deafult form behavior
      const formData = new FormData(event.currentTarget); //Get username and password data 
  
      const username = formData.get('username');
      const password = formData.get('password');
      const passwordConfirm = formData.get('passwordConfirm'); //Changed from login

      if(password == passwordConfirm) { //Changed from login
        
        if (username != null && password != null) {
    
          // Get request to backend
          axios.get("http://localhost:3000/teacherSignUp", {
            headers: {
              'username': username.toString(),
              'password': password.toString()
            }
          }).then(function(response) {  
  
            //Reroute user to login page
            window.location.href = "/login" //Changed from login
  
          }).catch(function(error) { //Error handling
  
            switch(error.response.status) { //Switch instead of if to make adding codes easier down the line
  
              case 409:
  
                setErrorText("Username already in use");
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

      } else { //Changed from login

        setErrorText("Passwords do not match")
        setErrorVisible(true)

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

      <div className={styles.signup}>

        <h1 className={styles.signupText}>SIGN UP</h1>

        <form onSubmit={signupHandler}>

          <input type="text" name="username" placeholder="Username"/>
          <input type="password" name="password" placeholder="Password"/>
          <input type="password" name="passwordConfirm" placeholder="Password confirmation"/> 
          <input className={styles.button} type="submit" value="Sign Up" />

        </form>

      </div>

    </div>
  );
}