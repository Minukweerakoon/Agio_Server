const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const authmiddleware3 = require("../middleware/authmiddleware3");
const Employee = require('../models/employeeModel');
const authMiddleware2 = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');
const payment = require('../models/TraPymentModel');
const Inquiry = require('../models/inquiryModel');
const Attendance = require('../models/AttendanceModel');
const attendanceModel = require('../models/AttendanceModel');
const csvtojson = require('csvtojson');

const booking = require('../models/TransportModel');
const Dregister = require('../models/TraDriverModel');
const Vregister = require('../models/TraVehicleModule')
const path = require('path')
const Announcement = require('../models/AnnHRSupervisorModel');
const AnnCal = require('../models/AnnCalModel')
const upload = require('../middleware/upload');
const uploadvideo = require('../middleware/uploadvideo');
const Notice = require('../models/AnnCalFormModel')

const generateInquiryID = () => {
    const randomNumber = Math.floor(Math.random() * 100000);
    const inquiryID = `INQ${randomNumber.toString().padStart(5, '0')}`;
    return inquiryID;
  };

  




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
            const { isAdmin, isDoctor, isAnnHrsup, isLeaveHrsup, islogisticsMan, isuniform, isinsu, isinquiry, isperfomace, seenNotifications, unseenNotifications ,medical_leave,annual_leave,general_leave,warning} = employee;




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
                department:employee.department,
                warning,


            
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
        const userid = req.query.userid; 
        let leave;
        
        if (userid) {
            
            leave = await Leave.find({ userid });
        } else {
           
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
router.get('/getuserfromleave/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        
        // Find the user in the Employee collection based on the provided userid
        const user = await Employee.findOne({ _id: userid });

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        // If the user is found, return the user's information
        res.status(200).json({ employee: user, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve user information.", success: false, error });
    }
});
router.get('/getleavedep', async (req, res) => {
    try {
        const department = req.query.department;
        console.log(department) // Get department from query parameter
        
        // Find employees with the specified department
        const employees = await Employee.find({ department }, '_id');
        console.log(employees); // Log the found employees
        
        // Extract IDs from the found employees
        const employeeIds = employees.map(employee => employee._id);
        console.log(employeeIds); // Log the extracted employee IDs
        
        // Fetch leave data for the found employee IDs with status "approved"
        const leaveData = await Leave.find({ userid: { $in: employeeIds }, status: 'approved' }); 
        console.log(leaveData) // Log the fetched leave data
        
        res.json({ leave: leaveData });
    } catch (error) {
        console.error('Error fetching leave data:', error);
        res.status(500).json({ error: 'Failed to fetch leave data' });
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
        const { name, Type, startDate, endDate, department, Description } = req.body;

        // Assuming Leave is a Mongoose model
        const updatedleave = await Leave.findByIdAndUpdate(
            id,
            { name, Type, startDate, endDate, department, Description },
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
router.post('/AnnHRsup2', authMiddleware2, upload.single('video'), async (req, res) => {
    try {
      // Check if 'video' key exists in req.file
      if (!req.file) {
        throw new Error('Video is required');
      }

      // Extract video from request
      const video = req.file;
      
      // Create a new announcement with the request body and video information
      const announcement = new Announcement({
        ...req.body,
        video: video ? video.filename : null
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
router.get('/AnnHRsupReport/month', async (req, res) => {
    try {
        const { month } = req.query; // Expected format 'YYYY-MM'
        const startDate = new Date(month + '-01'); // Start of the month
        const endDate = new Date(month + '-01');
        endDate.setMonth(endDate.getMonth() + 1); // One month after the start date

        const announcements = await Announcement.find({
            uploaddate: {
                $gte: startDate,
                $lt: endDate
            }
        });
        res.status(200).json(announcements);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching announcements for the month.", error });
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
// Assuming you have a comments collection or a way to fetch comments from your database
router.get('/comments', async (req, res) => {
    try {
      const comments = await Announcement.find();
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  




// router.post('/comments/:announcementId', authMiddleware2, async (req, res) => {
//     const { announcementId } = req.params;
//     const { text } = req.body;

//     if (!text) {
//         return res.status(400).json({ success: false, message: 'Comment text is required' });
//     }

//     try {
//         // Find the announcement by ID
//         const announcement = await Announcement.findById(announcementId);

//         if (!announcement) {
//             return res.status(404).json({ success: false, message: 'Announcement not found' });
//         }

//         // Add the comment to the announcement's comments array
//         announcement.comments.push({
//             text,
//             author: req.user.username, // Assuming you have authentication middleware that provides the user
//             createdAt: new Date(),
//         });

//         // Save the updated announcement
//         await announcement.save();

//         res.status(201).json({ success: true, message: 'Comment added successfully', comment: announcement.comments[announcement.comments.length - 1] });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Internal server error' });

//     }
// });




router.post('/comments/:announcementId', authMiddleware2, async (req, res) => {
    const { announcementId } = req.params;
    const { text, empId } = req.body;

    console.log(empId);
    console.log(req.body);

    if (!text) {
        return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    try {
        // Find the announcement by ID
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            // If the announcement doesn't exist, return an error immediately.
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        // Ensure the announcement has an initialized comments array
        if (!announcement.comment) {
            announcement.comment = [];
        }

        // Add the comment to the announcement's comments array
        const newComment = {
            text,
            empId, // employee ID from the request
            createdAt: new Date(),
        };

        console.log(newComment);

        announcement.comment.push(newComment);

        // Save the updated announcement
        await announcement.save();
        
        // Return the latest comment added along with a success message
        res.status(201).json({ success: true, message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/AnnCalNotice', async (req, res) => {
    try {
        
        const Notices = new Notice (req.body);
        await Notices.save();
        res.status(200).send({ message: "Booking uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Booking upload unsuccessful.", success: false, error });
    }
});
router.get('/event', async (req, res) => {
    try {
        const getNotice = await Notice.find({});
        if (!getNotice || getNotice.length === 0) {
            return res.status(404).send({ message: "No  getNotice found.", success: false });
        }
        res.status(200).send({ getNotice, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve general getNotice.", success: false, error });
    }
});
router.delete('/deletevent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Assuming EventModel is your model for the events collection
        const event = await Notice.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).send({ 
                message: "Event not found.", 
                success: false 
            });
        }

        res.status(200).send({ 
            message: "Event deleted successfully", 
            success: true 
        });
    } catch (error) {
        console.error('Failed to delete the event:', error);
        res.status(500).send({ 
            message: "Failed to delete event.", 
            success: false, 
            error 
        });
    }
});
// router.delete('/siyathugoiya/:id', async (req, res) => {
//     try {
//         const updatedEvent = await Notice.findByIdAndUpdate(id, {
//             title,
//             description,
//             submission,
//             expiryDate
//         }, { new: true });

//         if (!updatedEvent) {
//             return res.status(404).send({ message: "Event not found.", success: false });
//         }

//         res.status(200).send({ message: "Event updated successfully", success: true, event: updatedEvent });
//     } catch (error) {
//         console.error('Failed to update the event:', error);
//         res.status(500).send({ message: "Failed to update event.", success: false, error });
//     }
// });
// Assuming express is already set up with router

router.post('/rsvp/:eventId', authMiddleware2, async (req, res) => {
    const { eventId } = req.params;
    const { choice, empId,department } = req.body;

    console.log(eventId)

    if (!choice) {
        return res.status(400).json({ success: false, message: 'RSVP choice is required' });
    }

    try {
        const event = await Notice.findById(eventId); // Make sure to replace `Event` with your actual model
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (!event.response) {
            event.response = [];
        }

        const newResponse = {
            choice,
            empId,
            department,
            createdAt: new Date(),
        };

        event.response.push(newResponse);
        await event.save();
        
        res.status(201).json({ success: true, message: 'RSVP submitted successfully', response: newResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.get('/:noticeId/choiceCount', async (req, res) => {
    const { noticeId } = req.params;

    try {
        // Find the notice by ID
        const notice = await Notice.findById(noticeId);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        // Count occurrences of the word "in" in response choices
        const choiceCount = notice.response.reduce((count, response) => {
            // Check if the choice includes the word "in"
            if (response.choice.includes('in')) {
                return count + 1;
            }
            return count;
        }, 0);

        res.json({ count: choiceCount });
    } catch (error) {
        console.error('Error fetching notice:', error);
        res.status(500).json({ message: 'Server error' });
    }
});







////////////////////////////////////////// Inquiry Route ////////////////////////////////////////////////////////////////

//  new inquiry
router.post('/inquiry', async (req, res) => {
    try {
      const inquiryID = generateInquiryID();
      const inquiry = new Inquiry({
        inquiryID,
        ...req.body
      });
      await inquiry.save();
      const inqman = await Employee.findOne({isinquiry:true})
      const unseenNotifications = inqman.unseenNotifications
      unseenNotifications.push({
        type:"New inquiry request",
        message :`${ inquiry.username} has submitted an inquiry`,
        data:{
            inqid:inquiry._id,
            name: inquiry.name
        },
        onclickpath:"/"

    })
    await Employee.findByIdAndUpdate(inqman._id,{unseenNotifications});

  
      res.status(200).send({ message: "Inquiry uploaded successfully", success: true });
    } catch (error) {
      console.error("Error uploading inquiry:", error);
      res.status(500).send({ message: "Inquiry upload unsuccessful", success: false, error: error.message });
    }
  });

  router.get('/my-inquiries/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const inquiries = await Inquiry.find({ username }); // Fetch inquiries 
        const inquiriesWithID = inquiries.map(inquiry => ({
            ...inquiry.toJSON(),
            inquiryID: inquiry.inquiryID 
        }));
        res.status(200).json(inquiriesWithID);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch inquiries.' });
    }
});


  // Update inquiry status
  router.put('/updateinquiry/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body; 
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
      const inquiries = await Inquiry.find(); // Fetching the inquiries from here
      res.status(200).json(inquiries);
      console.log(inquiries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch inquiries.' });
    }
  });

  router.put('/:id/update-status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
      res.json(inquiry);
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });
  
  // Route for replying to an inquiry
router.put('/inquiry/:id/reply', async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;
  
    try {
      
      const inquiry = await Inquiry.findByIdAndUpdate(
        id,
        { reply, status: 'Done' }, 
        { new: true }
      );
      
      res.json(inquiry);
    } catch (error) {
      console.error('Error replying to inquiry:', error);
      res.status(500).json({ error: 'Failed to send reply' });
    }
  });
  
  
 

////////////////////////////////////////// End Inquiry Route ////////////////////////////////////////////////////////////////

/////////////////////////////////////////// Transport Route ////////////////////////////////////////////////////////////////





// POST a new Booking
router.post("/TraBooking", authMiddleware2, async (req, res) => {
    try {
        const { Type } = req.body;
        const Booking = new booking({ ...req.body, status: "pending" });
        await Booking.save();

        // Update seat count based on the vehicle type
        const vehicleType = Type.toLowerCase();
        const totalSeats = { bus: 100, van: 24 }; // Assuming lowercase vehicle types
        const updatedRemainingSeats = { ...totalSeats };

        // Update remaining seats count
        const vehicles = await Vregister.find({ type: vehicleType });
        const numOfVehicles = vehicles.length;
        updatedRemainingSeats[vehicleType] = totalSeats[vehicleType] * numOfVehicles;

        // Send updated seat count in response
        res.status(200).send({
            success: true,
            message: "Booking submission successful.",
            remainingSeats: updatedRemainingSeats,
        });

        // Your remaining logic for notifications goes here...
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error Submitting Booking request", success: false, error });
    }
});



// read Admin
router.get('/getTraBooking', async (req, res) => {
    try {
        const userid = req.query.userid; // Extract userId from query parameter
        let bookings;
        
        if (userid) {
            // If userId is provided, filter Bokking details by userId
            bookings = await booking.find({ userid });
        } else {
            // If userId is not provided, fetch all Booking details
            bookings = await booking.find();
        }

        if (!bookings || bookings.length === 0) {
            return res.status(404).send({ message: "No Booking details found.", success: false });
        }
        
        res.status(200).send({ bookings, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking details.", success: false, error });
    }

});

// read User

router.get('/getTraBooking3/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        const user = await Employee.findOne({ _id: userid });

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        const bookings = await booking.find({ userid });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No Booking requests found for this user.", success: false });
        }

        res.status(200).json({ bookings, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve Booking information.", success: false, error });
    }
});

// read update part
router.get('/getTraBooking2/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Booking = await booking.findById(id);
        if (!Booking) {
            return res.status(404).send({ message: "Booking not found.", success: false });
        }
        res.status(200).send({ Booking, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the Booking.", success: false, error });
    }
});


// Update an Booking

router.put('/updateTraBooking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { EmpName, EmpEmail, Type, bookingdate, Details } = req.body;

        // Assuming Booking is a Mongoose model
        const updatedBooking = await booking.findByIdAndUpdate(
            id,
            { EmpName, EmpEmail, Type, bookingdate, Details },
            { new: true } // To return the updated document
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Leave not found." });
        }

        res.json({ success: true, message: "Booking updated successfully.", bookings: updatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
 
 

router.post('/change_status_tra', async (req, res) => {
    try {
        const{bookingid,status,userid} = req.body;
        const Booking = await booking.findByIdAndUpdate(bookingid,{
            status,
        });
      
const user = await Employee.findOne({_id: userid});
const unseenNotifications = user.unseenNotifications
        unseenNotifications.push({
            type:"New Booking request changed",
            message :`Your request has been ${status}`,
            data:{
                bookingid:Booking._id,
                name: Booking.EmpName,
                onClickPath: "/Main_notifications"
            },
            onclickpath:"/"

        }

        )
        await Employee.findByIdAndUpdate(user._id,{unseenNotifications});
       
        res.status(200).send({
            message:"Booking status updated successfully",
            success : true,
            data: user,


        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking details.", success: false, error });
    }

});



// DELETE Booking
router.delete('/deletebooking/:id', async (req, res) => {
    console.log("delete roue")
    console.log(req.params.id)
    try {
        const bookings = await booking.findByIdAndDelete(req.params.id);
        if (!bookings) {
            return res.status(404).send({ message: "Booking not found.", success: false });
        }
        res.status(200).send({ message: "Booking deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to delete Booking.", success: false, error });
    }
});


// Driver Register
router.post('/Driveregister', async (req, res) => {
    try {
        
        const Dregisters = new Dregister (req.body);
        await Dregisters.save();
        res.status(200).send({ message: "Driver Register Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Driver Register unsuccessful.", success: false, error });
    }
});

// read driver register
router.get('/getdrivers', async (req, res) => {
    try {
        const drivers = await Dregister.find(); 
        if (!drivers || drivers.length === 0) {
            return res.status(404).send({ message: "No Driver found.", success: false });
        }
        res.status(200).send({ drivers, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Driver.", success: false, error });
    }
});

//read
router.get('/getdrivers2/:id', async (req, res) => {
    try {
        const { id } = req.params;
       const Dregisters = await Dregister.findById(id);
        if (!Dregisters) {
            return res.status(404).send({ message: "Driver not found.", success: false });
        }
        res.status(200).send({Dregisters, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the Driver.", success: false, error });
    }
});

// Update Driver

router.put('/updatedrivers/:id', async (req, res) => {
   try {
     const { id } = req.params;
     const updatedDrivers = await Dregister.findByIdAndUpdate(id, req.body, { new: true });
     if (!updatedDrivers) {
       return res.status(404).json({ success: false, message: "Driver not found." });
     }
     res.status(200).json({ success: true, message: "Driver updated successfully.", Dregisters: updatedDrivers });
   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal server error." });
   }
 });

// DELETE Driver
router.delete('/deletedrivers/:id', async (req, res) => {
    try {
        const Dregisters = await Dregister.findByIdAndDelete(req.params.id);
         if (!Dregisters) {
             return res.status(404).send({ message: "Driver not found.", success: false });
         }
         res.status(200).send({ message: "Driver deleted successfully", success: true });
     } catch (error) {
         console.log(error);
         res.status(500).send({ message: "Failed to delete Driver.", success: false, error });
     }
 });

 




// vehicle Register
// Vehicle Register
router.post('/Vehicleregister', async (req, res) => {
    try {
        let numSeats;
        if (req.body.Type === 'bus') {
            numSeats = 100 * req.body.numBuses; 
        } else if (req.body.Type === 'van') {
            numSeats = 24 * req.body.numVans; 
        }

        const vehicleRegister = new Vregister({ ...req.body, numSeats });
        await vehicleRegister.save();

        // Update total seat count based on the type of vehicle
        const totalSeats = { bus: 100, van: 24 }; 
        const updatedTotalSeats = { ...totalSeats };
        updatedTotalSeats[req.body.Type] += numSeats;

        res.status(200).send({ message: "Vehicle Registered Successfully", success: true, totalSeats: updatedTotalSeats });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Vehicle Registration Unsuccessful.", success: false, error });
    }
});



// read Vehicle register
router.get('/getVehicles', async (req, res) => {
    try {
        const vehicles = await Vregister.find(); 
        if (!vehicles || vehicles.length === 0) {
            return res.status(404).send({ message: "No Booking found.", success: false });
        }
        res.status(200).send({ vehicles, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Vehicle.", success: false, error });
    }
});

 //read
 router.get('/getVehicles2/:id', async (req, res) => {
    try {
        const { id } = req.params;
       const VehicleRegister = await Vregister.findById(id);
        if (!VehicleRegister) {
            return res.status(404).send({ message: "Vehicle not found.", success: false });
        }
        res.status(200).send({VehicleRegister, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the Vehicle.", success: false, error });
    }
});

// Update Vehicle

router.put('/updatevehicles/:id', async (req, res) => {
   try {
     const { id } = req.params;
     const updatedvehicles = await Vregister.findByIdAndUpdate(id, req.body, { new: true });
     if (!updatedvehicles) {
       return res.status(404).json({ success: false, message: "Vehicle not found." });
     }
     res.status(200).json({ success: true, message: "Vehicle updated successfully.", VehicleRegister: updatedvehicles });
   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal server error." });
   }
 });


 // DELETE Vehicle
 router.delete('/deletevehicles/:id', async (req, res) => {
    try {
        const VehicleRegister = await Vregister.findByIdAndDelete(req.params.id);
         if (!VehicleRegister) {
             return res.status(404).send({ message: "Vehicle not found.", success: false });
         }
         res.status(200).send({ message: "Vehicle deleted successfully", success: true });
     } catch (error) {
         console.log(error);
         res.status(500).send({ message: "Failed to delete Vehicle.", success: false, error });
     }
 });

// Payment booking slip upload
 router.use('/uploads1', express.static(path.join(__dirname, '../uploads1')));


router.post('/PaymentUpload', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const file = req.file.filename; 

        const pay = new payment({ file }); 
        await pay.save();
        res.status(200).send({ message: "Payment Slip Upload successful.", success: true, userId: id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Payment Slip Upload unsuccessful.", success: false, error });
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
        // Extract year from query parameter, default to current year if not provided
        const year = req.query.year || new Date().getFullYear();
        
        // Aggregate leaves to count medical leaves by month and year
        const monthlyMedicalLeaves = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Medical', // Filter for medical leaves
                    startDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } // Filter for leaves within the specified year
                }
            },
            {
                $project: {
                    month: { $month: '$startDate' }, // Extract month from startDate
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' }, // Group leaves by month and year
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Monthly Medical Leaves:', monthlyMedicalLeaves);

        // Map the aggregated data to an object with month as key and count as value
        const monthlyMedicalLeavesMap = {};
        monthlyMedicalLeaves.forEach(monthlyLeave => {
            // Get the month and year from the MongoDB date aggregation
            const { month, year } = monthlyLeave._id;
            // Get the count of medical leaves for this month
            const count = monthlyLeave.count;
            // Add the month and count to the map
            if (!monthlyMedicalLeavesMap[year]) {
                monthlyMedicalLeavesMap[year] = {};
            }
            monthlyMedicalLeavesMap[year][month] = count;
            // Log the month, year, and count
            console.log('Month:', month, 'Year:', year, 'Count:', count);
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
                    month: { $month: '$startDate' }, // Extract month from startDate
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' }, // Group leaves by month and year
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Monthly General Leaves:', monthlyGeneralLeavesData);

        // Map the aggregated data to an object with month as key and count as value
        const monthlyGeneralLeaves = {};
        monthlyGeneralLeavesData.forEach(data => {
            const { month, year } = data._id;
            const count = data.count;
            if (!monthlyGeneralLeaves[year]) {
                monthlyGeneralLeaves[year] = {};
            }
            monthlyGeneralLeaves[year][month] = count;
            // Log the month, year, and count
            console.log('Month:', month, 'Year:', year, 'Count:', count);
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
                    month: { $month: '$startDate' }, // Extract month from startDate
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' }, // Group leaves by month and year
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Monthly Annual Leaves:', monthlyAnnualLeavesData);

        // Map the aggregated data to an object with month as key and count as value
        const monthlyAnnualLeaves = {};
        monthlyAnnualLeavesData.forEach(data => {
            const { month, year } = data._id;
            const count = data.count;
            if (!monthlyAnnualLeaves[year]) {
                monthlyAnnualLeaves[year] = {};
            }
            monthlyAnnualLeaves[year][month] = count;
            // Log the month, year, and count
            console.log('Month:', month, 'Year:', year, 'Count:', count);
        });

        // Send the monthly annual leave count as a response
        res.json({ monthlyAnnualLeaves });
    } catch (error) {
        console.error('Error fetching monthly annual leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/quarterly-medical-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count medical leaves by quarter and year
        const quarterlyMedicalLeaves = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Medical' // Filter for medical leaves
                }
            },
            {
                $project: {
                    quarter: { $ceil: { $divide: [{ $month: '$startDate' }, 3] } }, // Extract quarter from startDate
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: { year: '$year', quarter: '$quarter' }, // Group leaves by year and quarter
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Quarterly Medical Leaves:', quarterlyMedicalLeaves);

        // Map the aggregated data to an object with year and quarter as keys and count as value
        const quarterlyMedicalLeavesMap = {};
        quarterlyMedicalLeaves.forEach(quarterlyLeave => {
            // Get the year and quarter from the MongoDB date aggregation
            const { year, quarter } = quarterlyLeave._id;
            // Get the count of medical leaves for this quarter and year
            const count = quarterlyLeave.count;
            // Initialize the object for the year if it doesn't exist
            if (!quarterlyMedicalLeavesMap[year]) {
                quarterlyMedicalLeavesMap[year] = {};
            }
            // Add the count for this quarter to the map
            quarterlyMedicalLeavesMap[year][quarter] = count;
            // Log the year, quarter, and count
            console.log('Year:', year, 'Quarter:', quarter, 'Count:', count);
        });

        // Send the quarterly medical leave count as a response
        res.json({ quarterlyMedicalLeaves: quarterlyMedicalLeavesMap });
    } catch (error) {
        console.error('Error fetching quarterly medical leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/quarterly-general-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count general leaves by quarter and year
        const quarterlyGeneralLeavesData = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'General' // Filter for general leaves
                }
            },
            {
                $project: {
                    quarter: { $ceil: { $divide: [{ $month: '$startDate' }, 3] } }, // Extract quarter from startDate
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: { year: '$year', quarter: '$quarter' }, // Group leaves by year and quarter
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Quarterly General Leaves:', quarterlyGeneralLeavesData);

        // Map the aggregated data to an object with year and quarter as keys and count as value
        const quarterlyGeneralLeaves = {};
        quarterlyGeneralLeavesData.forEach(data => {
            const { year, quarter } = data._id;
            const count = data.count;
            if (!quarterlyGeneralLeaves[year]) {
                quarterlyGeneralLeaves[year] = {};
            }
            quarterlyGeneralLeaves[year][quarter] = count;
            console.log('Year:', year, 'Quarter:', quarter, 'Count:', count);
        });

        // Send the quarterly general leave count as a response
        res.json({ quarterlyGeneralLeaves });
    } catch (error) {
        console.error('Error fetching quarterly general leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/yearly-medical-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count medical leaves by year
        const yearlyMedicalLeaves = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Medical' // Filter for medical leaves
                }
            },
            {
                $project: {
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: '$year', // Group leaves by year
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Yearly Medical Leaves:', yearlyMedicalLeaves);

        // Map the aggregated data to an object with year as key and count as value
        const yearlyMedicalLeavesMap = {};
        yearlyMedicalLeaves.forEach(yearlyLeave => {
            // Get the year from the MongoDB date aggregation
            const year = yearlyLeave._id;
            // Get the count of medical leaves for this year
            const count = yearlyLeave.count;
            // Add the year and count to the map
            yearlyMedicalLeavesMap[year] = count;
            // Log the year and count
            console.log('Year:', year, 'Count:', count);
        });

        // Send the yearly medical leave count as a response
        res.json({ yearlyMedicalLeaves: yearlyMedicalLeavesMap });
    } catch (error) {
        console.error('Error fetching yearly medical leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/quarterly-annual-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count annual leaves by quarter and year
        const quarterlyAnnualLeavesData = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Annual' // Filter for annual leaves
                }
            },
            {
                $project: {
                    quarter: { $ceil: { $divide: [{ $month: '$startDate' }, 3] } }, // Extract quarter from startDate
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: { year: '$year', quarter: '$quarter' }, // Group leaves by year and quarter
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Quarterly Annual Leaves:', quarterlyAnnualLeavesData);

        // Map the aggregated data to an object with year and quarter as keys and count as value
        const quarterlyAnnualLeaves = {};
        quarterlyAnnualLeavesData.forEach(data => {
            const { year, quarter } = data._id;
            const count = data.count;
            if (!quarterlyAnnualLeaves[year]) {
                quarterlyAnnualLeaves[year] = {};
            }
            quarterlyAnnualLeaves[year][quarter] = count;
            console.log('Year:', year, 'Quarter:', quarter, 'Count:', count);
        });

        // Send the quarterly annual leave count as a response
        res.json({ quarterlyAnnualLeaves });
    } catch (error) {
        console.error('Error fetching quarterly annual leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/yearly-general-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count general leaves by year
        const yearlyGeneralLeaves = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'General' // Filter for general leaves
                }
            },
            {
                $project: {
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: '$year', // Group leaves by year
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Yearly General Leaves:', yearlyGeneralLeaves);

        // Map the aggregated data to an object with year as key and count as value
        const yearlyGeneralLeavesMap = {};
        yearlyGeneralLeaves.forEach(yearlyLeave => {
            // Get the year from the MongoDB date aggregation
            const year = yearlyLeave._id;
            // Get the count of general leaves for this year
            const count = yearlyLeave.count;
            // Add the year and count to the map
            yearlyGeneralLeavesMap[year] = count;
            // Log the year and count
            console.log('Year:', year, 'Count:', count);
        });

        // Send the yearly general leave count as a response
        res.json({ yearlyGeneralLeaves: yearlyGeneralLeavesMap });
    } catch (error) {
        console.error('Error fetching yearly general leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route handler to fetch yearly annual leaves
router.get('/yearly-annual-leaves', async (req, res) => {
    try {
        // Aggregate leaves to count annual leaves by year
        const yearlyAnnualLeaves = await Leave.aggregate([
            {
                $match: {
                    status: 'approved', // Filter for approved leaves
                    Type: 'Annual' // Filter for annual leaves
                }
            },
            {
                $project: {
                    year: { $year: '$startDate' } // Extract year from startDate
                }
            },
            {
                $group: {
                    _id: '$year', // Group leaves by year
                    count: { $sum: 1 } // Count the number of leaves in each group
                }
            }
        ]);

        // Log the fetched data
        console.log('Yearly Annual Leaves:', yearlyAnnualLeaves);

        // Map the aggregated data to an object with year as key and count as value
        const yearlyAnnualLeavesMap = {};
        yearlyAnnualLeaves.forEach(yearlyLeave => {
            // Get the year from the MongoDB date aggregation
            const year = yearlyLeave._id;
            // Get the count of annual leaves for this year
            const count = yearlyLeave.count;
            // Add the year and count to the map
            yearlyAnnualLeavesMap[year] = count;
            // Log the year and count
            console.log('Year:', year, 'Count:', count);
        });

        // Send the yearly annual leave count as a response
        res.json({ yearlyAnnualLeaves: yearlyAnnualLeavesMap });
    } catch (error) {
        console.error('Error fetching yearly annual leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get-employee-comment-info-by-id/:id', async (req, res) => {
    const oid = req.params.id;
    try {
        const employee = await Employee.findOne({ _id: oid });
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

//attendance


router.post("/uploadexcelattendance", upload.single("csvFile"), async (req, res) => {
    try {
        const jsonArray = await csvtojson().fromFile(req.file.path);

        // Loop through each attendance record from the CSV file
        for (const attendance of jsonArray) {
            // Generate a unique identifier for each attendance record
            const uniqueEmpId = `${attendance.empid}_${Date.now()}`;
        
            // Set the new unique identifier
            attendance.empid = uniqueEmpId;
        
            // Insert the attendance record into the database
            await attendanceModel.create(attendance);
        }
        return res.json({ message: "Data added successfully" });
    } catch (error) {
        console.error('Error uploading attendance data:', error);
        return res.status(500).json({ error: 'Failed to upload attendance data. Please try again later.' });
    }
});



//read attendance
router.get('/attendance', async (req, res) => {
    try {
        const { date } = req.query;
        
        // Find attendance records for the specified date
        const attendanceData = await Attendance.find({ createdAt: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) } });
        
        res.json({ attendance: attendanceData });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Failed to fetch attendance data' });
    }
});
router.get('/attendance_leave', async (req, res) => {
    try {
        const date = req.query.date; // Date parameter from the query string
        console.log(date);
        
        // Convert the date string to a Date object
        const startDate = new Date(date);

        // Extract the date portion without the time
        const startDateWithoutTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

        // Find leaves with the specified start date
        const leaves = await Leave.find({ startDate: startDateWithoutTime });
        console.log(leaves)

        // Extract employee IDs from leaves
        const leaveIds = leaves.map(leave => leave.userid);
        console.log(leaveIds)

        // Find employees with leave IDs
        const employees = await Employee.find({ _id: { $in: leaveIds } });
        console.log(employees)

        // Extract employee IDs
        const employeeIds = employees.map(employee => employee.empid);
        console.log(employeeIds);

        res.json({ leaves, employeeIds });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Failed to fetch attendance data' });
    }
});

// POST request to add a suggested date to an existing leave request
router.post('/:id/suggest-date', async (req, res) => {
    try {
        const leaveId = req.params.id; // Extract the leave ID from the request parameters
        const { suggestedDate } = req.body; // Extract the suggested date from the request body

        // Find the leave request by its ID
        const leaveRequest = await Leave.findById(leaveId);

        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        // Update the suggested date field
        leaveRequest.suggestedDate = suggestedDate;

        // Save the updated leave request to the database
        const updatedLeaveRequest = await leaveRequest.save();

        // Respond with the updated leave request
        res.status(200).json(updatedLeaveRequest);
    } catch (error) {
        // If an error occurs, respond with an error message
        console.error("Error adding suggested date to leave request:", error);
        res.status(500).json({ message: "Failed to add suggested date to leave request" });
    }
});

router.put('/:id/suggest-date', async (req, res) => {
    try {
        const leaveId = req.params.id; // Extract the leave ID from the request parameters
        const { suggestedDate } = req.body; // Extract the suggested date from the request body

        // Find the leave request by its ID
        const leaveRequest = await Leave.findById(leaveId);

        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        // Update the suggested date field
        leaveRequest.suggestedDate = suggestedDate;

        // Save the updated leave request to the database
        const updatedLeaveRequest = await leaveRequest.save();

        // Respond with the updated leave request
        res.status(200).json(updatedLeaveRequest);
    } catch (error) {
        // If an error occurs, respond with an error message
        console.error("Error updating suggested date of leave request:", error);
        res.status(500).json({ message: "Failed to update suggested date of leave request" });
    }
});

router.post('/addWarning', async (req, res) => {
    try {
        const { empid, warning } = req.body;

        // Find the employee by empid
        const employee = await Employee.findOne({ empid });

        // If employee is not found, return 404 status
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Add the warning to the employee's warnings array
        employee.warnings.push(warning);

        // Save the updated employee document
        await employee.save();

        // Return success response
        return res.status(200).json({ message: 'Warning added successfully' });
    } catch (error) {
        console.error('Error adding warning:', error);
        // Return error response
        return res.status(500).json({ error: 'Failed to add warning' });
    }
});
router.get('/getWarnings/:empid', async (req, res) => {
    try {
        // Get the employee ID from the route parameters
        const { empid } = req.params;

        // Find the employee by ID
        const employee = await Employee.findOne({ empid });

        // If employee is not found, return 404 status
        if (!employee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }

        // If the employee has warnings, return them
        if (employee.warnings && employee.warnings.length > 0) {
            return res.status(200).json({ success: true, warnings: employee.warnings });
        } else {
            return res.status(200).json({ success: true, warnings: [] }); // No warnings found for the employee
        }
    } catch (error) {
        console.error('Error fetching warnings:', error);
        // Return error response
        res.status(500).json({ success: false, error: 'Failed to fetch warnings' });
    }
});
//reporttt
router.get('/leave-report', async (req, res) => {
    try {
        const { month, department: selectedDepartment } = req.query; // Rename department to selectedDepartment

        // Parse the month string to extract the year and month components
        const [year, monthNumber] = month.split('-');

        // Construct start and end dates for the month
        const startDate = new Date(year, monthNumber - 1, 1); // Note: month is zero-based
        const endDate = new Date(year, monthNumber, 0); // Last day of the month

        // Fetch leave data for the specified month
        const leaveData = await Leave.find({
            startDate: { $gte: startDate },
            endDate: { $lte: endDate }
        });

        // Extract unique user IDs from leave data
        const userIds = [...new Set(leaveData.map(leave => leave.userid))];

        // Fetch employee data for the extracted user IDs and matching department
        const employees = await Employee.find({ _id: { $in: userIds }, department: selectedDepartment });

        // Combine leave and employee data
        const reportData = leaveData.map(leave => {
            const employee = employees.find(emp => emp._id.toString() === leave.userid.toString());
            if (employee && employee.department === selectedDepartment) {
                return { leave, department: employee.department };
            } else {
                return null; // If employee department doesn't match selected department, return null
            }
        }).filter(entry => entry !== null); // Filter out null entries

        // Respond with the fetched report data
        res.json({ success: true, data: reportData });
    } catch (error) {
        // Handle errors
        console.error('Error fetching leave report:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leave report.' });
    }
});
router.get('/leave-count-dep', async (req, res) => {
    try {
      const { department, month } = req.query;
  
      // Find all employees in the given department
      const employees = await Employee.find({ department });
  
      // Extract employee IDs
      const employeeIds = employees.map(emp => emp._id);
      console.log(employeeIds)
  
      // Parse month into year and month
      const [year, monthNumber] = month.split('-');
  
      // Find all leaves for the given department and month
      const leaves = await Leave.find({
        userid: { $in: employeeIds },
        startDate: {
          $gte: new Date(year, monthNumber - 1, 1), // Start of the month
          $lt: new Date(year, monthNumber, 1) // Start of next month
        },
        status: 'approved' // Consider only approved leaves
      });
  
      // Initialize counters
      let annualLeaveCount = 0;
      let medicalLeaveCount = 0;
      let generalLeaveCount = 0;
  
      // Count leave types
      leaves.forEach(leave => {
        switch (leave.Type) {
          case 'Annual':
            annualLeaveCount++;
            break;
          case 'Medical':
            medicalLeaveCount++;
            break;
          case 'General':
            generalLeaveCount++;
            break;
          default:
            break;
        }
      });

      console.log(annualLeaveCount,medicalLeaveCount,generalLeaveCount)
  
      // Send response with leave counts
      res.json({
        annualLeaveCount,
        medicalLeaveCount,
        generalLeaveCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });









module.exports = router;
