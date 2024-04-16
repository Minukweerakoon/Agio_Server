const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Employee = require('../models/employeeModel');
const authMiddleware2 = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');
const Inquiry = require('../models/inquiryModel');

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

//INQUIRIESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS

router.post('/inquiry', async (req, res) => {
    try {
        
        const inquiry = new Inquiry (req.body);
        await inquiry.save();
        res.status(200).send({ message: "Inquiry uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Inquiry upload unsuccessful.", success: false, error });
    }
});

router.get('/my-inquiries/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const inquiries = await Inquiry.find({ username }); // Fetch inquiries for the provided username
      res.status(200).json(inquiries);
      console.log(inquiries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch inquiries.' });
    }
  });
  
  // Update inquiry status
  router.put('/updateinquiry/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body; // Assuming the request body contains the fields to be updated
        const inquiry = await Inquiry.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found.", success: false });
        }
        res.status(200).json({ message: "Inquiry updated successfully", success: true, inquiry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update inquiry", success: false, error });
    }
});


  
//  deleting an inquiry
router.delete('/deleteinquiry/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).send({ message: "Inquiry not found.", success: false });
        }
        res.status(200).send({ message: "Inquiry deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to delete inquiry request.", success: false, error });
    }
});


//Admins Code

router.get('/all-inquiries', async (req, res) => {
    try {
      const inquiries = await Inquiry.find(); // Fetch all inquiries
      res.status(200).json(inquiries);
      console.log(inquiries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch inquiries.' });
    }
  });

  router.post('/api/inquiries/:id/update-status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the inquiry by id in your database
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Update the status of the inquiry
    inquiry.status = status; // Assuming 'status' is a field in your Inquiry model
    await inquiry.save(); // Save the updated inquiry to the database

    // Return the updated inquiry
    return res.status(200).json({ message: 'Status updated successfully', inquiry });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/api/inquiries/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply, username } = req.body;

  try {
    // Find the inquiry by id in your database
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Save the reply to the inquiry
    inquiry.reply = reply;
    inquiry.repliedBy = username; // Assuming you have a field to store who replied
    await inquiry.save();

    // Return the updated inquiry
    return res.status(200).json({ message: 'Reply sent successfully', inquiry });
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

  

  
  module.exports = router;




