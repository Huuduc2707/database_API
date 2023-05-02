-- Create new database
CREATE DATABASE IF NOT EXISTS smartHome;

-- Switch to the new database
USE smartHome;

-- Create tables
-- User table
CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    UNIQUE KEY email (email)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;




-- Devices table
CREATE TABLE IF NOT EXISTS devices(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type INT NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;



-- Setting table
CREATE TABLE IF NOT EXISTS setting(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dateCreate DATETIME NOT NULL,
    record INT,
    status INT,
    onTime DATETIME,
    offTime DATETIME,
    deviceId INT NOT NULL,
    FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;


-- Report table
CREATE TABLE IF NOT EXISTS report(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dateCreate DATETIME NOT NULL,
    fromDate DATETIME NOT NULL,
    toDate DATETIME NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;



-- Data table
CREATE TABLE IF NOT EXISTS data(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dateCreate DATETIME NOT NULL,
    record INT,
    deviceId INT NOT NULL,
    FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;