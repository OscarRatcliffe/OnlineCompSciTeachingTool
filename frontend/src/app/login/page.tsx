'use client'
import { log } from "console";
import styles from "./page.module.scss";
import { FormEvent } from "react";
import axios from "axios";

function login(event: any){

    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const username = formData.get('username');
    const password = formData.get('password');

    axios.post("http://localhost:3000/login", {
      "Username": username,
      "Password": password
    }).then(function(response) {
      console.log(response)
    })

  console.log(username, password)
}

export default function Home() {
  return (
    <div className={styles.main}>

      <div className={styles.login}>

        <h1 className={styles.LoginText}>KNICK KNACK</h1>

        <form onSubmit={login}>

          <input type="text" name="username" placeholder="Username"/>
          <input type="password" name="password" placeholder="Password"/>
          <input className={styles.button} type="submit" value="Login" />

        </form>

      </div>

    </div>
  );
}
