CREATE TABLE teacher (
    id SERIAL PRIMARY KEY,
    username TEXT,
    password TEXT,
    passwordSalt TEXT
)

CREATE TABLE class (
    id SERIAL PRIMARY KEY,
    averageGrade FLOAT,
    CONSTRAINT fk_teacher
        FOREIGN KEY(teacher_id)
        REFERENCES teacher(id)
)

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    username TEXT,
    password TEXT,
    passwordSalt TEXT,
    avgDiffFromMean FLOAT,
    CONSTRAINT fk_class
        FOREIGN KEY(class_id)
        REFERENCES class(id)
)

CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    imageID TEXT,
    deadline TIME,
    expired BOOLEAN,
    CONSTRAINT fk_task_classs
        FOREIGN KEY(class_id)
        REFERENCES class(id)
)

