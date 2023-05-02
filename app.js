require('dotenv').config();
const conn = require('./config/db');
const utils = require('./utils/utils');
const express = require('express');
const app = express();
app.use(express.json())

//Log in
app.post("/login", (req, res)=>{
    const {email} = req.body;
    conn.execute("SELECT * FROM users WHERE email = ?", [email], (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            console.log(results);
            if(!results.length){
                conn.execute("INSERT INTO users (email) VALUES (?)", [email], (err)=>{
                    if(err) res.status(500).send(err);
                })
            }
        }
    })
    //utils.generateToken(res, email);
});


//Read specific setting
app.get("/get/setting", utils.authenticateToken, (req, res)=>{
    const {deviceID} = req.body;
    conn.execute("SELECT setting.id AS settingId, dateCreate, record, status, onTime, offTime, deviceId, type, userId FROM setting JOIN devices ON deviceId = devices.id WHERE deviceId = ? ORDER BY dateCreate", [deviceID],(err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    });
});

//Read all setting
app.get("/get/allSetting", utils.authenticateToken, (req, res)=>{
    conn.execute("SELECT setting.id AS settingId, dateCreate, record, status, onTime, offTime, deviceId, type, userId FROM setting JOIN devices ON deviceId = devices.id GROUP BY deviceId ORDER BY dateCreate", (err, results)=>{
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
    let sql = "INSERT INTO setting (dateCreate";
    let values = "?";
    let param = [dateCreate];
    if(record){
        sql += ", record";
        values += ", ?";
        param.push(record);
    }
    if(status){
        sql += ", status";
        values += ", ?";
        param.push(status);
    }
    if(onTime){
        sql += ", onTime, offTime";
        values += ", ?, ?";
        param.push(onTime, offTime);
    }
    sql += `, deviceId) VALUES (${values}, ?)`;
    param.push(deviceID);
    conn.execute(sql, param, (err)=>{
        if(err) res.status(500).send(err);
        else res.status(200).json({"res": "success"});
    })
});

//Read specific data
app.get("/get/data", utils.authenticateToken, (req, res)=>{
    const {deviceID} = req.body;
    conn.execute("SELECT data.id AS recordId, dateCreate, record, deviceId, type, userId FROM data JOIN devices ON deviceId = devices.id WHERE deviceId = ? ORDER BY dateCreate", [deviceID], (err, results)=>{
        if(err) res.status(500).send(err);
        else{
            if(results.length) res.status(200).json(results);
            else res.status(404).json({"res": "Can not find this info"});
        }
    })
});

//Read all data
app.get("/get/allData", utils.authenticateToken, (req, res)=>{
    conn.execute("SELECT data.id AS recordId, dateCreate, record, deviceId, type, userId FROM data JOIN devices ON deviceId = devices.id GROUP BY deviceId ORDER BY dateCreate", (err, results)=>{
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
app.get("/get/device", utils.authenticateToken, (req, res)=>{
    const{deviceID, userID} = req.body;
    let sql = "SELECT * FROM devices JOIN users ON userId = users.id WHERE userId = ? ";
    let param = [userID];
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
        else res.status(200).json({"res": "success"});
    })
});

module.exports = app;