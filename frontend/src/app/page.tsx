'use client'
import styles from "./page.module.scss";
import cookie from 'cookie';

export default function Home() {


  //Check for login cookie
  let cookiesParsed = cookie.parse(document.cookie); 
  
  if(cookiesParsed.sessionID == undefined) {

    window.location.href = "/login" //If no cookie go to login page

  }


  return (
    <div className={styles.main}>

      <h1>Dashboard</h1>

    </div>
  );
}
