# TODO
- Student dashboard
    - Fetch task list
    - Open tasks
- Online code editor
- Remote running
- Interactive terminal
- Solution marking

- Pass in host IP to docker for backend access
- Pass login info in body not URL

# Write up structure
- DB container
- DB tables / references
- Creating backend
- Connecting DB to TS
- TS create API endpoint
- Creating frontend
- Login / sessionID function
- Error messages
- Auth check func / Checking session ID on home page
- CORS and other middleware - Issue when first runnings
- Sign up page / backend
- Main page teacher
    - Get classes list
        - Part of auth check func (Not yet written about)
    - Dynamically list classes
    - Switch between classes
    - Get task list
        - View tasks
        - Create tasks
        
    - Create students
    - Create classes
        - Modified check auth func again
    - Log out
- Main page student
    - Adapted view
    - Updated authcheck func to handler teacher classes and student classes differently (OUTER JOIN SQL)
- Code editor
- Create container initial attempt - Talk about challenges
- Running code in containers
- Linking the 2
- Multi line support

- Saving code

# Prototype stages
- Teacher login, create class, create students, create task
- Student work on / run task
- Task submission / review
