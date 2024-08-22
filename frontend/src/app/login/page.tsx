import styles from "./page.module.scss";

export default function Home() {
  return (
    <div className={styles.main}>

      <div className={styles.login}>

      </div>

        <h1>LOGIN</h1>

        <input type="text" id="username"/>
        <input type="password" id="password" />

    </div>
  );
}
