const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Employee = require('../models/employeeModel');
const authMiddleware2 = require("../middleware/authMiddleware2");

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

router.get('/employee/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch insurance data by EmployeeID
        const insurance = await Insurance.findOne({ id });
        if (!insurance) {
            console.error("Insurance data not found for EmployeeID:", id);
            return res.status(404).json({ message: "Insurance data not found" });
        }
        
        // Fetch employee's username based on the EmployeeID
        const employee = await Employee.findOne({ _id: id });
        if (!employee) {
            console.error("Employee not found for EmployeeID:", id);
            return res.status(404).json({ message: "Employee not found", success: false });
        }
        
        // Send response with insurance data and employee's username
        res.json({ success: true, insurance, username: employee.username_log });
    } catch (error) {
        console.error("Error fetching insurance data:", error);
        res.status(500).json({ message: "Failed to fetch insurance data", error });
    }
});

module.exports = router;
