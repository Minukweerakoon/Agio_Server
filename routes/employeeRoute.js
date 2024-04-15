const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Employee = require('../models/employeeModel');
const authMiddleware2 = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');
const Announcement = require('../models/AnnHRSupervisorModel');
const AnnCal = require('../models/AnnCalModel')
const upload = require('../middleware/upload');




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
router.get('/employees', async (req, res) => {
    try {
      const employees = await Employee.find();
      res.json({ success: true, data: employees });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
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
            const { isAdmin, isDoctor, isAnnHrsup, isLeaveHrsup, islogisticsMan, isuniform, isinsu, isinquiry, isperfomace, seenNotifications, unseenNotifications ,medical_leave,annual_leave,general_leave} = employee;




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
                annual_leave,
                general_leave,
                username: employee.username_log,
                fullname:employee.fname,
                password : employee.password_log,
                userid: employee._id,
                empid :employee.empid,
                department:employee.department


                // Include other necessary fields here
            } });
        }
    } catch (error) {
        res.status(500).send({ message: "Error getting user info", success: false, error });
    }
});

router.post("/leaveEmpform", authMiddleware2,upload.single('file') ,async (req, res) => {
    try {
        const file = req.file;
        const newleave = new Leave({...req.body ,status :"pending",file})
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
router.post("/leavecountmed", authMiddleware2, async (req, res) => {
    try {
        

        // Find the employee document by userid
        const employee = await Employee.findOne({ _id: req.body.userid });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        // Deduct one from the medical_leave field
        employee.medical_leave -= 1;

        // Save the updated employee document
        await employee.save();

        res.status(200).json({ success: true, message: 'Medical leave deducted successfully.', employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
router.post("/leavecountgeneral", authMiddleware2, async (req, res) => {
    try {
        

        // Find the employee document by userid
        const employee = await Employee.findOne({ _id: req.body.userid });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        // Deduct one from the medical_leave field
        employee.general_leave -= 1;

        // Save the updated employee document
        await employee.save();

        res.status(200).json({ success: true, message: 'General leave deducted successfully.', employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
router.post("/leavecountannual", authMiddleware2, async (req, res) => {
    try {
        

        // Find the employee document by userid
        const employee = await Employee.findOne({ _id: req.body.userid });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        // Deduct one from the medical_leave field
        employee.annual_leave -= 1;

        // Save the updated employee document
        await employee.save();

        res.status(200).json({ success: true, message: 'Annual leave deducted successfully.', employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
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




//announcments
router.post('/AnnHRsup', authMiddleware2, upload.single('file'), async (req, res) => {
    try {
        const file = req.file
        // Create a new announcement with the request body and file information
        const announcement = new Announcement({
            ...req.body, file 
           // Assuming you might have multiple files in the future
        });

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

        res.status(200).send({ message: "Announcement uploaded successfully and notifications sent to all employees.", success: true, announcement });
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




router.get('/getAnnHRsupgen', async (req, res) => {
    try {
        const announcements = await Announcement.find({ Type: 'General' });
        if (!announcements || announcements.length === 0) {
            return res.status(404).send({ message: "No general announcements found.", success: false });
        }
        res.status(200).send({ announcements, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve general announcements.", success: false, error });
    }
});
router.get('/getAnnHRsupSpecific', async (req, res) => {
    try {
        // Extract user's department from request query
        const userDepartment = req.query.department;
        console.log(userDepartment)

        // Fetch announcements based on user's department and type
        const announcements = await Announcement.find({ Department: userDepartment, Type: 'Specific' });
        
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
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
const employees = [
    {  department: 'Logistics' },
    {  department: 'Procurement Department' },
    {  department: 'Quality Assurance' },
    {  department: 'Production Department' },
    {  department: 'Sales and Marketing' },
    {  department: 'Finance and Accounting' },
    // Add more employees
  ];
  router.post('/sendAnnouncement', (req, res) => {
    const { department } = req.body;
    const targetedEmployees = employees.filter(emp => emp.department === department);
  
    // Logic to send the announcement to these employees
    // For example, you could send an email, a push notification, etc.
  
    res.send({ success: true, message: `Announcement sent to ${department} department.` });
  });


router.get('/announcement/:type', async (req, res) => {
    try {
        const type = req.params.type;
        
        // Find announcement with specific type
        const announcement = await Announcement.findOne({ type });

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Find employees in the department
        const employees = await Employee.find({ department: announcement.department });

        // Send announcement to employees
        // This is a basic example, in production, you might send emails or push notifications
        employees.forEach(employee => {
            console.log(`Sending announcement "${announcement.title}" to ${employee.name} (${employee.email})`);
        });

        res.status(200).json({ message: 'Announcement sent to department' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/total-medical-leaves', async (req, res) => {
    try {
        // Fetch medical leave data for all employees
        const employees = await Employee.find({} );

        // Calculate total medical leaves for all employees
        let totalMedicalLeaves = 0;
        employees.forEach(employee => {
            // Deduct leaves taken by each employee from the default medical_leave value
            const remainingMedicalLeave = (4 - employee.medical_leave);
            
            totalMedicalLeaves += remainingMedicalLeave;
        });

        // Return total medical leaves
        res.json({ totalMedicalLeaves });
    } catch (error) {
        console.error('Error fetching total medical leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/total-general-leaves', async (req, res) => {
    try {
        // Fetch medical leave data for all employees
        const employees = await Employee.find({} );

        // Calculate total medical leaves for all employees
        let totalGeneralLeaves = 0;
        employees.forEach(employee => {
            // Deduct leaves taken by each employee from the default medical_leave value
            const remainingMedicalLeave = (6 - employee.general_leave);
            
            totalGeneralLeaves += remainingMedicalLeave;
        });

        // Return total medical leaves
        res.json({ totalGeneralLeaves });
    } catch (error) {
        console.error('Error fetching total general leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/total-annual-leaves', async (req, res) => {
    try {
        // Fetch medical leave data for all employees
        const employees = await Employee.find({} );

        // Calculate total medical leaves for all employees
        let totalAnnualLeaves = 0;
        employees.forEach(employee => {
            // Deduct leaves taken by each employee from the default medical_leave value
            const remainingannualLeave = (10 - employee.annual_leave);
            
            totalAnnualLeaves += remainingannualLeave;
        });

        // Return total medical leaves
        res.json({ totalAnnualLeaves });

    } catch (error) {
        console.error('Error fetching total annual leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.get('/remaining-medical-leaves', async (req, res) => {

    try {
        // Fetch medical leave data for all employees
        const employees = await Employee.find({});

        // Calculate remaining medical leaves for each employee
        const medicalLeavesData = employees.map(employee => {
            // Deduct leaves taken by each employee from the default medical_leave value
            const remainingMedicalLeave = 4 - employee.medical_leave;
            return {
                employeeId: employee._id,
                remainingMedicalLeave: remainingMedicalLeave >= 0 ? remainingMedicalLeave : 0 // Ensure remaining leaves are non-negative
            };
        });

        // Return remaining medical leaves data
        res.json({ medicalLeavesData });
    } catch (error) {
        console.error('Error fetching remaining medical leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getemployeeinfobyuserid',  authMiddleware2, async (req, res) => {
    try {
        
        const employee = await Employee.findOne({ _id: req.body.userid });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Return the employee details
        res.json({ data: employee });
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({ error: 'Internal server error' });
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
router.get('/monthly-medical-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count medical leaves by month
        const monthlyMedicalLeaves = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Medical' // Filter for medical leaves
                }
            },
            {
                $project: {
                    month: { $month: '$startDate' } // Extract month from startDate
                }
            },
            {
                $group: {
                    _id: '$month', // Group leaves by month
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Monthly Medical Leaves:', monthlyMedicalLeaves);

        // Map the aggregated data to an object with month as key and count as value
        const monthlyMedicalLeavesMap = {};
        monthlyMedicalLeaves.forEach(monthlyLeave => {
            // Get the month from the MongoDB date aggregation
            const month = monthlyLeave._id;
            // Get the count of medical leaves for this month
            const count = monthlyLeave.count;
            // Add the month and count to the map
            monthlyMedicalLeavesMap[month] = count;
            // Log the month and count
            console.log('Month:', month, 'Count:', count);
        });

        // Send the monthly medical leave count as a response
        res.json({ monthlyMedicalLeaves: monthlyMedicalLeavesMap });
    } catch (error) {
        console.error('Error fetching monthly medical leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/monthly-general-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count general leaves by month
        const monthlyGeneralLeavesData = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'General' // Filter for general leaves
                }
            },
            {
                $project: {
                    month: { $month: '$startDate' } // Extract month from startDate
                }
            },
            {
                $group: {
                    _id: '$month', // Group leaves by month
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Monthly General Leaves:', monthlyGeneralLeavesData);

        // Map the aggregated data to an object with month as key and count as value
        const monthlyGeneralLeaves = {};
        monthlyGeneralLeavesData.forEach(data => {
            // Get the month from the MongoDB date aggregation
            const month = data._id;
            // Get the count of general leaves for this month
            const count = data.count;
            // Add the month and count to the map
            monthlyGeneralLeaves[month] = count;
            // Log the month and count
            console.log('Month:', month, 'Count:', count);
        });

        // Send the monthly general leave count as a response
        res.json({ monthlyGeneralLeaves });
    } catch (error) {
        console.error('Error fetching monthly general leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/monthly-annual-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count annual leaves by month
        const monthlyAnnualLeavesData = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Annual' // Filter for annual leaves
                }
            },
            {
                $project: {
                    month: { $month: '$startDate' } // Extract month from startDate
                }
            },
            {
                $group: {
                    _id: '$month', // Group leaves by month
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Monthly Annual Leaves:', monthlyAnnualLeavesData);

        // Map the aggregated data to an object with month as key and count as value
        const monthlyAnnualLeaves = {};
        monthlyAnnualLeavesData.forEach(data => {
            // Get the month from the MongoDB date aggregation
            const month = data._id;
            // Get the count of annual leaves for this month
            const count = data.count;
            // Add the month and count to the map
            monthlyAnnualLeaves[month] = count;
            // Log the month and count
            console.log('Month:', month, 'Count:', count);
        });

        // Send the monthly annual leave count as a response
        res.json({ monthlyAnnualLeaves });
    } catch (error) {
        console.error('Error fetching monthly annual leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







module.exports = router;
