require('dotenv').config();
const conn = require('./config/db');
const utils = require('./utils/utils');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json())

//Log in
app.post("/login", (req, res)=>{
    const {email} = req.body;
    conn.execute("SELECT * FROM users WHERE email = ?", [email], (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(!results.length){
                conn.execute("INSERT INTO users (email) VALUES (?)", [email], (err)=>{
                    if(err) res.status(500).send(err);
                })
            }
        }
    })
    utils.generateToken(res, email);
});


//Read specific setting
app.post("/get/setting", utils.authenticateToken, (req, res)=>{
    const {deviceID, email} = req.body;
    let sql = "SELECT setting.id AS settingId, dateCreate, record, status, onTime, offTime, deviceId, type, userId FROM setting JOIN devices ON deviceId = devices.id JOIN users ON userId = users.id WHERE users.email = ? ";
    let param = [email];
    if(deviceID){
        sql += "AND deviceId = ?";
        param.push(deviceID);
    }
    sql += " ORDER BY dateCreate";
    conn.execute(sql, param, (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    });
});

//Read all setting
app.post("/get/allSetting", utils.authenticateToken, (req, res)=>{
    conn.execute("SELECT setting.id AS settingId, dateCreate, record, status, onTime, offTime, deviceId, type, userId FROM setting JOIN devices ON deviceId = devices.id ORDER BY dateCreate", (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    });
});

//Write setting
app.post("/write/setting", utils.authenticateToken, (req, res)=>{
    const {dateCreate, record, status, onTime, offTime, deviceID} = req.body;
    let sql;
    let param;
    conn.execute("SELECT * FROM setting WHERE deviceId = ?", [deviceID], (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length){
                sql = "UPDATE setting SET dateCreate = ?";
                param = [dateCreate];
                if(record){
                    sql += ", record = ?";
                    param.push(record);
                }
                if(status){
                    sql += ", status = ?";
                    param.push(status);
                }
                if(onTime){
                    sql += ", onTime = ?, offTime = ?";
                    param.push(onTime, offTime);
                }
                sql += ` WHERE deviceId = ?`;
                param.push(deviceID);
            }
        }
        conn.execute(sql, param, (err)=>{
            if(err) res.status(500).send(err);
            else res.status(200).json({"res": "success"});
        });
    });
});

//Read specific data
app.post("/get/data", utils.authenticateToken, (req, res)=>{
    const {deviceID, email} = req.body;
    let sql = "SELECT data.id AS recordId, dateCreate, record, deviceId, type, userId FROM data JOIN devices ON deviceId = devices.id JOIN users ON users.id = userId WHERE users.email = ? ";
    let param = [email];
    if(deviceID){
        sql += "AND deviceId = ?";
        param.push(deviceID);
    }
    sql += " ORDER BY dateCreate";
    conn.execute(sql, param, (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    })
});

//Read all data
app.post("/get/allData", utils.authenticateToken, (req, res)=>{
    conn.execute("SELECT data.id AS recordId, dateCreate, record, deviceId, type, userId FROM data JOIN devices ON deviceId = devices.id ORDER BY dateCreate", (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    })
});

//Write data
app.post("/write/data", utils.authenticateToken, (req, res)=>{
    const {dateCreate, record, deviceID} = req.body;
    conn.execute("INSERT INTO data (dateCreate, record, deviceID) VALUES (?, ?, ?)", [dateCreate, record, deviceID], (err)=>{
        if(err) res.status(500).send(err);
        else res.status(200).json({"res": "success"});
    })
});

//Write report info
app.post("/write/report", utils.authenticateToken, (req, res)=>{
    const {dateCreate, fromDate, toDate, userID} = req.body;
    conn.execute("INSERT INTO report (dateCreate, fromDate, toDate, userId) VALUES (?, ?, ?, ?)", [dateCreate, fromDate, toDate, userID], (err)=>{
        if(err) res.status(500).send(err);
        else res.status(200).json({"res": "success"});
    })
});

//Read devices info
app.post("/get/device", utils.authenticateToken, (req, res)=>{
    const{deviceID, email} = req.body;
    let sql = "SELECT devices.id, type, userId, users.email FROM devices JOIN users ON userId = users.id WHERE users.email = ? ";
    let param = [email];
    if(deviceID){
        sql += "AND deviceId = ?";
        param.push(deviceID);
    }
    conn.execute(sql, param, (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    })
});

//Write devices info
app.post("/write/device", utils.authenticateToken, (req, res)=>{
    const {type, userID} = req.body;
    conn.execute("INSERT INTO devices (type, userId) VALUES (?, ?)", [type, userID], (err)=>{
        if(err) res.status(500).send(err);
        else{
            conn.execute("SELECT MAX(id) as id FROM devices", (err, results)=>{
                if(err) res.status(500).send(err);
                else{
                    conn.execute("INSERT INTO setting (record, deviceId) VALUES (0, ?)", [results[0]['id']], (err)=>{
                        if(err) res.status(500).send(err);
                    });
                }
            });
            res.status(200).json({"res": "success"});
        }
    })
});

module.exports = app;