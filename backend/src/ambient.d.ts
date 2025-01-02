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

type taskListFormat = {
    "ID": number,
    "Title": string,
    "Deadline": number,
    "Description": string
}

type authCheckFormat = {
    "userType": userGroup,
    "classes": Array<classFormat>,
    "userID": number
} 