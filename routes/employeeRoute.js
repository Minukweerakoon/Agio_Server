const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Employee = require('../models/employeeModel');
const authMiddleware2 = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');
const Announcement = require('../models/AnnHRSupervisorModel');

router.post("/Main_register", async (req, res) => {
    try {
        const userExists = await Employee.findOne({ username_log: req.body.username_log });
        if (userExists) {
            return res.status(200).send({ message: "Username already exists.", success: false });
        }
        

        

        const newEmployee = new Employee({...req.body,medical_leave : 4,general_leave: 6,annual_leave:10}); // Use User model for consistency
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
            const { isAdmin, isDoctor, isAnnHrsup, isLeaveHrsup, islogisticsMan, isuniform, isinsu, isinquiry, isperfomace, seenNotifications, unseenNotifications ,medical_leave} = employee;




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
                medical_leave,
                username: employee.username_log,
                fullname:employee.fname,
                password : employee.password_log,
                userid: employee._id

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

router.get('/getleave', async (req, res) => {
    try {
        const userid = req.query.userid; // Extract userId from query parameter
        let leave;
        
        if (userid) {
            // If userId is provided, filter leave details by userId
            leave = await Leave.find({ userid });
        } else {
            // If userId is not provided, fetch all leave details
            leave = await Leave.find();
        }

        if (!leave || leave.length === 0) {
            return res.status(404).send({ message: "No leave details found.", success: false });
        }
        
        res.status(200).send({ leave, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve leave details.", success: false, error });
    }

});
router.get('/getleave2/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        const user = await Employee.findOne({ _id: userid });

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        const leave = await Leave.find({ userid });

        if (!leave || leave.length === 0) {
            return res.status(404).json({ message: "No leave requests found for this user.", success: false });
        }

        res.status(200).json({ leave, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve leave information.", success: false, error });
    }
});

router.get('/getleave3/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).send({ message: "Leave not found.", success: false });
        }
        res.status(200).send({ leave, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the leave.", success: false, error });
    }
});

router.put('/updateleave/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, Type, RangePicker, department, Description } = req.body;

        // Assuming Announcement is a Mongoose model
        const updatedleave = await Leave.findByIdAndUpdate(
            id,
            { name, Type, RangePicker, department, Description },
            { new: true } // To return the updated document
        );

        if (!updatedleave) {
            return res.status(404).json({ success: false, message: "Leave not found." });
        }

        res.json({ success: true, message: "Leave updated successfully.", leave: updatedleave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});



router.post('/change_status', async (req, res) => {
    try {
        const{leaveid,status,userid} = req.body;
        const newleave = await Leave.findByIdAndUpdate(leaveid,{
            status,
        });
      
const user = await Employee.findOne({_id: userid});
const unseenNotifications = user.unseenNotifications
        unseenNotifications.push({
            type:"New leave request changed",
            message :`Your request has been ${status}`,
            data:{
                leaveid:newleave._id,
                name: newleave.name,
                onClickPath: "/Main_notifications"
            },
            onclickpath:"/"

        }

        )
        await Employee.findByIdAndUpdate(user._id,{unseenNotifications});
       
        res.status(200).send({
            message:"Leave status updated successfully",
            success : true,
            data: newleave,


        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve leave details.", success: false, error });
    }

});
router.post("/mark_all_seen", authMiddleware2, async (req, res) => {
    try {
        const user = await Employee.findOne({_id: req.body.userid})
        const unseenNotifications = user?.unseenNotifications;
        const seenNotifications = user?.seenNotifications;
        seenNotifications.push(...unseenNotifications);
        user.unseenNotifications = [];
        user.seenNotifications = seenNotifications;
        const updateduser = await user.save()
        updateduser.password_log = undefined;
        res.status(200).send(
            {
                success:true,
                message : "All notifications marked as seen.",
                data:updateduser,
            }
        )
        

        
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error Submitting leave request", success: false, error });
    }
});
router.post("/delete_all_notifications", authMiddleware2, async (req, res) => {
    try {
        const user = await Employee.findOne({_id: req.body.userid})
       user.seenNotifications = [];
        user.unseenNotifications = [];
        const updateduser = await user.save();
        updateduser.password_log = undefined;
        res.status(200).send(
            {
                success:true,
                message : "All notifications are deleted.",
                data:updateduser,
            }
        )
        

        
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error Submitting leave request", success: false, error });
    }
});


router.delete('/deleteleave/:id', async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) {
            return res.status(404).send({ message: "Leave not found.", success: false });
        }
        res.status(200).send({ message: "Leave deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to delete leave request.", success: false, error });
    }
});

router.post('/approveleave/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedleave = await Leave.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!updatedleave) {
            return res.status(404).json({ success: false, message: "Leave not found." });
        }

        // If the leave type is "Medical" and the status is approved, deduct one from the medical_leave field
        if (updatedleave.Type === 'Medical') {
            const user = await Employee.findOne({ userid: updatedleave.userid });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            // Deduct one from the medical_leave field
            user.medical_leave -= 1;

            // Save the updated user data
            await user.save();
        }
        
        res.json({ success: true, message: "Leave approved successfully.", leave: updatedleave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//announcments

router.post('/AnnHRsup', authMiddleware2, async (req, res) => {
    try {
        // Save the new announcement
        const announcement = new Announcement(req.body);
        await announcement.save();
        
        // Create the notification object
        const notification = {
            type: "New announcement update",
            message: `New announcement: ${announcement.anntitle}`,
            data: {
                announcementId: announcement._id,
                announcementName: announcement.anntitle
            },
            onclickpath: "/" // Update this path as necessary
        };
        
        // Update all employees with the new notification
        await Employee.updateMany({}, { $push: { unseenNotifications: notification } });
        
        res.status(200).send({ message: "Announcement uploaded successfully and notifications sent to all employees.", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Announcement upload unsuccessful.", success: false, error });
    }
});




router.get('/getAnnHRsup', async (req, res) => {
    try {
        const announcements = await Announcement.find();
        if (!announcements || announcements.length === 0) {
            return res.status(404).send({ message: "No announcements found.", success: false });
        }
        res.status(200).send({ announcements, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve announcements.", success: false, error });
    }
});
router.get('/getAnnHRsup2/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({ announcement, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the announcement.", success: false, error });
    }
});
router.put('/updateAnnHRsup/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
        if(!updatedAnnouncement) {
            return res.status(404).json({ success: false, message: "Announcement not found." });
        }
        res.json({ success: true, message: "Announcement updated successfully.", announcement: updatedAnnouncement });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.post('/deduct_medical_leave', async (req, res) => {
    try {
        const { userid } = req.body;

        // Find the employee document by userid
        const employee = await Employee.findOne({ userid });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        // Decrement the medical_leave field by one
        employee.medical_leave -= 1;

        // Save the updated employee document
        await employee.save();

        res.status(200).json({ success: true, message: 'Medical leave deducted successfully.', employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


router.delete('/deleteAnnHRsup/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({ message: "Announcement deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to delete announcement.", success: false, error });
    }
});




module.exports = router;
