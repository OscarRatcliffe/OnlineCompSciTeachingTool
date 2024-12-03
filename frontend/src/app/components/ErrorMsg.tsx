'use client'
import styles from "./ErrorMsg.module.scss";
import { useEffect, useRef } from 'react';

export default function ErrorMsg(props: any) { //Pass in values from calling page
  const msgBoxRef = useRef<HTMLDivElement>(null); //Create null Div reference to assign later

  useEffect(() => { //Run on element load

    const msgBox = msgBoxRef.current as HTMLDivElement; //Set the msgBox object to control the div element

    console.log("Error message loaded")

    msgBox.style.opacity = '1';

    const timer = setTimeout(() => { //Wait before fade out

      msgBox.style.opacity = '0'; // Fade out

    }, 3000);

    return () => clearTimeout(timer);

  }, []);
  
  return (

      <div ref={msgBoxRef} className={styles.Error}> 

        <p>{props.error}</p> 

    </div>
  );
}
