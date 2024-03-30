const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Employee = require('../models/employeeModel');
const authMiddleware2 = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');

router.post("/Main_register", async (req, res) => {
    try {
        const userExists = await Employee.findOne({ username_log: req.body.username_log });
        if (userExists) {
            return res.status(200).send({ message: "Username already exists.", success: false });
        }
        

        

        const newEmployee = new Employee(req.body); // Use User model for consistency
        await newEmployee.save();

        res.status(200).send({ message: "Employee registration successful.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error registering employee", success: false, error });
    }
});

router.post("/Main_login", async (req, res) => {
    try {
        const employee = await Employee.findOne({ username_log: req.body.username_log });
        if (!employee) {
            return res.status(200).send({ message: "Username does not exist", success: false });
        }
        const isMatch = req.body.password_log === employee.password_log;
        if (!isMatch) {
            return res.status(200).send({ message: "Password is incorrect", success: false });
        } else {
            const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            res.status(200).send({ message: "Login Successful", success: true, data: token });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error login in", success: false, error });
    }
});

router.post('/get-employee-info-by-id', authMiddleware2, async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.body.employeeId });
        if (!employee) {
            return res.status(200).send({ message: "Employee does not exist", success: false });
        } else {
            // Extract isAdmin value from the employee document
            const { isAdmin, isDoctor, isAnnHrsup, isLeaveHrsup, islogisticsMan, isuniform, isinsu, isinquiry, isperfomace, seenNotifications, unseenNotifications } = employee;




            // Send response with isAdmin value and other data
            res.status(200).send({ success: true, data: { 
                isAdmin,
                isAnnHrsup,
                isDoctor,
                isLeaveHrsup,
                islogisticsMan,
                isuniform,
                isinsu,
                isinquiry,
                isperfomace,
                seenNotifications,
                unseenNotifications,
                username: employee.username_log,
                fullname:employee.fname,
                password : employee.password_log
                // Include other necessary fields here
            } });
        }
    } catch (error) {
        res.status(500).send({ message: "Error getting user info", success: false, error });
    }
});
router.post("/leaveEmpform", authMiddleware2, async (req, res) => {
    try {
        const newleave = new Leave({...req.body ,status :"pending"})
        await newleave.save();
        const hrsup = await Employee.findOne({isLeaveHrsup:true})
        const unseenNotifications = hrsup.unseenNotifications
        unseenNotifications.push({
            type:"New leave request",
            message :`${ newleave.name} has submitted a leave request`,
            data:{
                leaveid:newleave._id,
                name: newleave.name
            },
            onclickpath:"/"

        }

        )
        await Employee.findByIdAndUpdate(hrsup._id,{unseenNotifications});
        res.status(200).send(
            {
                success:true,
                 message: "Leave submission successful.",
            }
        );

        
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error Submitting leave request", success: false, error });
    }
});

module.exports = router;