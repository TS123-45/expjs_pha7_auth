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