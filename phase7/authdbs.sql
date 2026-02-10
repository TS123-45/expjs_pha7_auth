create database authdb;

use authdb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE user_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  otp VARCHAR(10),
  expires_at BIGINT
);

select * from user_otps;
select * from users;

CREATE TABLE smsusers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE smsuser_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15),
  otp VARCHAR(6),
  expires_at BIGINT
);

select * from smsuser_otps;
select * from smsusers;

CREATE TABLE viewtable (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
age INT,
city VARCHAR(100)
);
SELECT * FROM viewtable;

SELECT * FROM userslist;
SELECT * FROM marklist;

CREATE TABLE userslist (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL
);
-- Student
INSERT INTO userslist (username, password, role)
VALUES ('student1', 'hashed_password_here', 'student');
-- Teacher
INSERT INTO userslist (username, password, role)
VALUES ('teacher1', 'hashed_password_here', 'teacher');
-- Admin
INSERT INTO userslist (username, password, role)
VALUES ('admin1', 'hashed_password_here', 'admin');

CREATE TABLE marklist (
  mark_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100),
  marks INT,
  FOREIGN KEY (student_id) REFERENCES userslist(user_id)
);
INSERT INTO marklist (student_id, subject, marks) VALUES
(1, 'Mathematics', 85),
(1, 'Physics', 78),
(1, 'Chemistry', 88);

INSERT INTO marklist (student_id, subject, marks) VALUES
(4, 'Mathematics', 90),
(4, 'Physics', 82),
(4, 'Chemistry', 87);

INSERT INTO marklist (student_id, subject, marks) VALUES
(7, 'Mathematics', 90),
(7, 'Physics', 82),
(7, 'Chemistry', 87);

SELECT user_id, username, role FROM userslist;

CREATE DATABASE oauthdb;
USE oauthdb;

CREATE TABLE google_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from google_users;
