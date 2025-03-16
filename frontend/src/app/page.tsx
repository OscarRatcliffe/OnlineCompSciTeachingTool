'use client'
import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.scss";
import cookie from 'cookie';
import ErrorMsg from "./components/ErrorMsg";

type Class = Array<{
  name: string;
  id: number;
  selected: boolean;
}>

type taskListFormat = {
  "ID": number,
  "Title": string,
  "Deadline": number,
  "Description": string
}

export default function Home() {

  const [errorText, setErrorText] = useState("Internal error");
  const [errorVisible, setErrorVisible] = useState(false);

  const [createNewUserVisable, setCreateNewUserVisable] = useState(false);

  const [createNewClassVisable, setCreateNewClassVisable] = useState(false);

  const [codeEditorVisible, setCodeEditorVisible] = useState(false);
  const [terminalResponse, setTerminalResponse] = useState("Run your code to get an output!");

  const [isTeacher, setIsTeacher] = useState(true); 

  const [currentClass, setCurrentClass] = useState(-1);

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

  async function checkAuth(sessionID: string) {

    await axios.get("http://localhost:3000/AuthCheck", {

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

  async function taskListHandler(currentClass: number, sessionID: string) {

    let returnValue: Array<taskListFormat> = []

    console.log(currentClass, sessionID)

    await axios.get("http://localhost:3000/getTaskList", {
      headers: {
        "classid": currentClass,
        "sessionid": sessionID
      }
      }).then(function(response) {

        for (let i = 0; i < response.data.length; i++) {

          returnValue.push({
            "ID": response.data[i].ID,
            "Title": response.data[i].Title,
            "Deadline": response.data[i].Deadline,
            "Description": response.data[i].Description
          })
        }

    }).catch(function(error) {})

    console.log(returnValue)

    setTaskList(returnValue)
   
  }

  async function newTaskHandler(event: any){
  
    event.preventDefault(); //Stops deafult form behavior
    const formData = new FormData(event.currentTarget); 

    const title = formData.get('title') as FormDataEntryValue;
    const description = formData.get('description') as FormDataEntryValue;

    console.log(title, description, currentClass, sessionID)

      // Get request to backend
      await axios.get("http://localhost:3000/createNewTask", {
        headers: {
          'title': title.toString(),
          'description': description.toString(),
          'classID': currentClass,
          'sessionID': sessionID
        }

      }).catch(function(error) { //Error handling

        switch(error.response.status) { //Switch instead of if to make adding codes easier down the line

            case 403:
              setErrorText("Permissions error")
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

    function newStudentHandler() {
      setCreateNewUserVisable(true)
    }

    function newClassHandler() {
      setCreateNewClassVisable(true)
    }

    function codeEditorHandler() {
      setCodeEditorVisible(true)
    }

  async function newStudentCreationHandler(event: any) {

    event.preventDefault(); //Stops deafult form behavior
    const formData = new FormData(event.currentTarget); 

    const username = formData.get('username') as FormDataEntryValue;
    const password = formData.get('password') as FormDataEntryValue;
    const passwordCheck = formData.get('passwordCheck') as FormDataEntryValue;

    if(username == "" || password == "") {
      
      setErrorText("Please enter a Username & Password");
      setErrorVisible(true);

    }

    else if(password != passwordCheck) {

      setErrorText("Passwords do not match");
      setErrorVisible(true);

    } else {

      // Get request to backend
      await axios.get("http://localhost:3000/studentSignUp", {
        headers: {
          'Username': username.toString(),
          'Password': password.toString(),
          'classID': currentClass,
          'sessionID': sessionID
        }

      }).catch(function(error) { //Error handling

        switch(error.response.status) { //Switch instead of if to make adding codes easier down the line

            case 403:
              setErrorText("Permissions error")
              break;

          case 500:

            setErrorText("Internal server error")
            break;
            

          default:

            setErrorText(`Unexpected error - ${error.response.status}`)

        }

        setErrorVisible(true) //Show error message

      })

      setCreateNewUserVisable(false)
    }
    }

    async function newClassCreationHandler(event: any) {

      event.preventDefault(); //Stops deafult form behavior
      const formData = new FormData(event.currentTarget); 
  
      const className = formData.get('name') as FormDataEntryValue;
  
        // Get request to backend
        await axios.get("http://localhost:3000/createClass", {
          headers: {
            'classname': className.toString(),
            'sessionid': sessionID,
          }
  
        }).catch(function(error) { //Error handling
  
          switch(error.response.status) { //Switch instead of if to make adding codes easier down the line
  
              case 403:
                setErrorText("Permissions error")
                break;
  
            case 500:
  
              setErrorText("Internal server error")
              break;
              
  
            default:
  
              setErrorText(`Unexpected error - ${error.response.status}`)
  
          }
  
          setErrorVisible(true) //Show error message
  
        })
  
        setCreateNewUserVisable(false)
      }

      async function codeRunHandler(event: any) {

        event.preventDefault(); //Stops deafult form behavior
        const formData = new FormData(event.currentTarget); 
    
        const code = formData.get('code') as FormDataEntryValue;
    
          // Get request to backend
          await axios.get("http://localhost:3000/runCode", {
            headers: {
              'code': code.toString(),
              'sessionid': sessionID,
            }
    
          }).then(function(response) {

            console.log(response.data)

            setTerminalResponse(response.data.terminalRes)
    
        }).catch(function(error) { //Error handling
    
            switch(error.response.status) { //Switch instead of if to make adding codes easier down the line
    
                case 403:
                  setErrorText("Permissions error")
                  break;
    
              case 500:
    
                setErrorText("Internal server error")
                break;
                
    
              default:
    
                setErrorText(`Unexpected error - ${error.response.status}`)
    
            }
    
            setErrorVisible(true) //Show error message
    
          })
    
          setCreateNewUserVisable(false)
        }

      async function closePopups() {

        setCreateNewClassVisable(false)
        setCreateNewUserVisable(false)
        setCodeEditorVisible(false)
        
      }

      async function logOut() {

        document.cookie = "sessionID=; Max-Age=0"
        window.location.href = "/login"

      }
  
    

  useEffect(() => { //On page load

    let cookiesParsed = cookie.parse(document.cookie); 
    setSessionID(cookiesParsed.sessionID);

    //Check for login cookie
    if(sessionID == undefined) {

      window.location.href = "/login" //If no cookie go to login page

    }

    (async () => {

      await checkAuth(cookiesParsed.sessionID) 

    })();

    if (errorVisible) {

      const timer = setTimeout(() => { //Wait before fade out

        setErrorVisible(false)
  
      }, 4000); //Wait until element has faded out
  
      return () => clearTimeout(timer);
    }

  }, [errorVisible]);

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
                taskListHandler(classItem.id, sessionID) //Update task lists
                console.log('current class = ' + classItem.id)
              }}
              className={styles.Item}
              id={classItem.selected && styles.Selected}
              key={classItem.id}>

                <p className={styles.Text}>{classItem.name}</p>

              </div>
            ))
          }
          <button onClick={newClassHandler}>Add Class</button>
      </div>

      <div className={styles.mainPage} key={currentClass}>

            {errorVisible && (
            
                    <ErrorMsg
                      key={errorVisible.toString()} //Force reloads element
                      id="error"
                      error={errorText}
                    ></ErrorMsg>
            
                  )}

            {
                taskList.map((taskItem: any) => (

                  <div className={styles.task} key={taskItem.ID}>

                    <h3>{taskItem.Title}</h3>
                    <p>{taskItem.Description}</p>

                  </div>

                ))
              }

              <div className={styles.newTask}>

                <form className={styles.newTaskForm} onSubmit={newTaskHandler}>

                  <textarea name="title" placeholder="Title"/>
                  <textarea name="description" placeholder="Description"/>
                  <input className={styles.button} type="submit" value="Create New Task" />

                </form>

              </div>

              <div className={styles.newStudent}> 

                <button onClick={newStudentHandler}>Add Student</button>

              </div>

              <div className={styles.logOut}> 

                <button onClick={logOut}>LogOut</button>

              </div>

      </div>

      {createNewUserVisable && (
        
      <div className={styles.formBG}>
      
          <div className={styles.form}>
          
                  <h2>NEW STUDENT</h2>

                  <form onSubmit={newStudentCreationHandler}>

                    <input type="text" name="username" placeholder="Username"/>
                    <input type="password"name="password" placeholder="Password"/>
                    <input type="password"name="passwordCheck" placeholder="Password Check"/>
                    <input className={styles.button} type="submit" value="Create User" />
                    <input className={styles.button} type="button" onClick={closePopups} value="Close" />

                  </form>

          </div>

      </div>

      )}

      {createNewClassVisable && (
        
        <div className={styles.formBG}>
        
            <div className={styles.form}>
            
                    <h2>NEW CLASS</h2>
  
                    <form onSubmit={newClassCreationHandler}> 
  
                      <input type="text" name="name" placeholder="Class Name"/>
                      <input className={styles.button} type="submit" value="Create Class" />
                      <input className={styles.button} type="button" onClick={closePopups} value="Close" />
  
                    </form>
  
            </div>
  
        </div>
  
      )}
      
    </div>
  );
} else { //Student page

  return (
    <div className={styles.main}>

    <div className={styles.titleBar}>

      <h1 className={styles.Title}>KNICK KNACK</h1>

    </div>

    <div className={styles.classBar}>

        <h1 className={styles.Title}>MENU</h1>

        <div

              className={styles.Item}
              id={styles.Selected}>

                <p className={styles.Text}>Home</p>

              </div>
      </div>

    <div className={styles.mainPage} key={currentClass}>

      <div className={styles.student}>

          {errorVisible && (
          
                  <ErrorMsg
                    key={errorVisible.toString()} //Force reloads element
                    id="error"
                    error={errorText}
                  ></ErrorMsg>
          
                )}

          {
              taskList.map((taskItem: any) => (

                <div className={styles.task} key={taskItem.ID}>

                  <h3>{taskItem.Title}</h3>
                  <p>{taskItem.Description}</p>
                  <button onClick={codeEditorHandler}>Code editor</button>
                </div>

              ))
            }

            <div className={styles.logOut}> 

              <button onClick={logOut}>LogOut</button>

            </div>

    </div>

    {codeEditorVisible && (
        
        <div className={styles.codeEditor}>
        
            <div className={styles.form}>
            
                    <h2>CODE EDITOR</h2>
  
                    <form onSubmit={codeRunHandler}> 
  
                      <textarea name="code" placeholder="Code"/>
                      <div>{terminalResponse}</div>
                      <input className={styles.button} type="submit" value="Run" />
                      <input className={styles.button} type="button" onClick={closePopups} value="Close" />
  
                    </form>
  
            </div>
  
        </div>
  
      )}

    </div>
    
  </div>
);

}
}
