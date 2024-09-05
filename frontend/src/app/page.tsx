'use client'
import { useEffect } from "react";
import styles from "./page.module.scss";
import cookie from 'cookie';

export default function Home() {

  useEffect(() => { //On page load

    //Check for login cookie
    let cookiesParsed = cookie.parse(document.cookie); 
    
    if(cookiesParsed.sessionID == undefined) {

      window.location.href = "/login" //If no cookie go to login page

    }

    console.log(process.env.NEXT_PUBLIC_HOST_IP)
  }, []);


  return (
    <div className={styles.main}>

      <h1>Dashboard</h1>

    </div>
  );
}
