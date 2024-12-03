//Custom types
type userGroup = "Student" | "Teacher"

type loginFormat = {
    "Username": string,
    "Password": string
}

type classFormat = {
    "ID": number,
    "Name": string
}

type authCheckFormat = {
    "userType": userGroup,
    "classes": Array<classFormat> 
} 

type taskListFormat = {
    "ID": number,
    "Title": string,
    "Deadline": number
}