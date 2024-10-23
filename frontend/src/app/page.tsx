'use client'
import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.scss";
import cookie from 'cookie';

type Class = Array<{
  name: string;
  id: number;
  selected: boolean;
}>

type taskListFormat = {
  "ID": number,
  "Title": string,
  "Deadline": number
}

export default function Home() {

  const [isTeacher, setIsTeacher] = useState(true); 

  const [currentClass, setCurrentClass] = useState(0);

  const [classesList, setClassesList] = useState([{}])

  const [sessionID, setSessionID] = useState('')

  const [taskList, setTaskList] = useState<Array<taskListFormat>>([])

  function changeClass(classID: number): void {

    for (let i = 0; i < (classesList as Class).length; i++) {

      if((classesList as Class)[i].id == currentClass) {

        (classesList as Class)[i].selected = false;

      }

      else if((classesList as Class)[i].id == classID) {

        (classesList as Class)[i].selected = true; 

      }

    }

    setCurrentClass(classID)
  }

  function checkAuth(sessionID: string) {

    axios.get("http://localhost:3000/AuthCheck", {

      headers: {
        'sessionid': sessionID
      }

    }).then(function(response) {

      if(response.data.userType == "Student") {

        setIsTeacher(false)

      } else {

        setIsTeacher(true)

      }

      // Error if no teachers found
      if (response.data.classes.length == 0) {

        setClassesList([{
              "name": "",
              "id": -1,
              "selected": true
            }])

      } else {

        let newClassesList = []

        for(let i = 0; i < response.data.classes.length; i++) {   

          newClassesList.push({
            "name": response.data.classes[i].Name,
            "id": response.data.classes[i].ID,
            "selected": false
          })   
           
        }

        // Populate task list for deafult task
        taskListHandler(newClassesList[0].id, sessionID)

        // Auto select first class in list
        newClassesList[0].selected = true
  
        setCurrentClass(newClassesList[0].id)
  
        setClassesList(newClassesList)

      }

    }).catch(function(error) {

      if(error.response.status == 403) {

        document.cookie = "sessionID=; Max-Age=0"
        window.location.href = "/login"

      }

    })

  }

  function taskListHandler(currentClass: number, sessionID: string) {

    let returnValue: Array<taskListFormat> = []

    console.log(currentClass, sessionID)

    axios.get("http://localhost:3000/getTaskList", {
      headers: {
        "classid": currentClass,
        "sessionid": sessionID
      }
      }).then(function(response) {

        for (let i = 0; i < response.data.length; i++) {

          returnValue.push({
            "ID": response.data[i].ID,
            "Title": response.data[i].Title,
            "Deadline": response.data[i].Deadline
          })
        }

    }).catch(function(error) {})

    console.log(returnValue)

    setTaskList(returnValue)
   
  }

  useEffect(() => { //On page load

    let cookiesParsed = cookie.parse(document.cookie); 
    setSessionID(cookiesParsed.sessionID);

    //Check for login cookie
    if(sessionID == undefined) {

      window.location.href = "/login" //If no cookie go to login page

    }

    checkAuth(cookiesParsed.sessionID) 

  }, []);

  //Return the index of a class given its ID
  function getClassIndex(classID: number): number {

    let returnValue = 0

    for (let i = 0; i < classesList.length; i++) {

      if ((classesList[i] as {id: number}).id == classID) {

        returnValue = i
      }

    }

    return returnValue

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

          {
            classesList.map((classItem: any) => (
              <div
              onClick={() => {
                changeClass(classItem.id)
                taskListHandler(currentClass, sessionID) //Update task lists
              }}
              className={styles.Item}
              id={classItem.selected && styles.Selected}
              key={classItem.id}>

                <p className={styles.Text}>{classItem.name}</p>

              </div>
            ))
          }
      </div>

      <div className={styles.mainPage} key={currentClass}>

            {
                taskList.map((taskItem: any) => (
                  <div key={taskItem.ID}>
                    <p>{taskItem.Title}</p>
                    <p>{taskItem.ID}</p>
                  </div>
                ))
              }

      </div>
      
    </div>
  );
}
}
