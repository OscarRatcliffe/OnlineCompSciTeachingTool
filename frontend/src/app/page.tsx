'use client'
import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import cookie from 'cookie';

export default function Home() {

  const [isTeacher, setIsTeacher] = useState(true); 

  const [currentClass, setCurrentClass] = useState(0);

  const [classesList, setClassesList] = useState([
   {
    "name": "Test class",
    "id": 0,
    "selected": true
  },{
    "name": "Year 12 2024-2025",
    "id": 1,
    "selected": false
  }])

  useEffect(() => { //On page load

    //Check for login cookie
    let cookiesParsed = cookie.parse(document.cookie); 
    
    if(cookiesParsed.sessionID == undefined) {

      window.location.href = "/login" //If no cookie go to login page

    }

    console.log(process.env.NEXT_PUBLIC_HOST_IP)
  }, []);

  function changeClass(classID: number): void {

    classesList[classID].selected = true
    classesList[currentClass].selected = false

    setCurrentClass(classID)
  }

  // Render different pages for students and teachers
  if(isTeacher) {
  return (
      <div className={styles.main}>

      <div className={styles.titleBar}>

        <h1 className={styles.Title}>KNICK KNACK</h1>

      </div>

      <div className={styles.classBar}>

        <h1 className={styles.Title}>CLASSES</h1>

        <>
          {
            classesList.map((classItem: any) => (
              <div
              onClick={() => changeClass(classItem.id)}
              className={styles.Item}
              id={classItem.selected && styles.Selected}
              key={classItem.id}>

                <p className={styles.Text}>{classItem.name}</p>

              </div>
            ))
          }
        </>

      {/* TODO: Create new class */}
      </div>

      <div className={styles.mainPage}>

          <p>{classesList[currentClass].name}</p>

      </div>
      
    </div>
  );
}
}
