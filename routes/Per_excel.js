const router = require("express").Router();
const multer = require("multer");
const csvtojson = require("csvtojson");
const records = require("../models/per_performance_record");
const performance_record = require("../models/per_performance_record");
const Employee = require("../models/employeeModel");
const { default: mongoose } = require("mongoose");
const authMiddleware2 = require("../middleware/authMiddleware2");
const rewardassignmiddleware = require("../middleware/AssignRewards")
const Targetm = require("../models/per_Target");
const Reward = require("../models/per_Reward")
const PDFDocument = require("pdfkit");
const path = require('path');
const fs = require('fs');



const storage = multer.diskStorage({
   
    destination:(req,file,cb)=>{
        cb(null,"./Per_uploads");
        
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }    
})
const upload = multer({
    storage,
})

router.route("/uploadexcel").post(upload.single("csvFile"),async(req,res)=>{
  console.log("upload route") 
  try{


    const jsonArray=await csvtojson().fromFile(req.file.path);
    const recordScore = jsonArray.map(record =>{
      const score = (record.YieldCutsWet * 0.5) + (record.YieldDry * 0.5) + (record.Grade_A_Cuts * 1) + (record.Grade_B_Cuts * 0.8) + (record.Grade_C_Cuts * 0.5) - (record.Grade_F_Cuts * 1);
      return {...record, score};
    })
    records.insertMany(recordScore);
    return res.json("Added sucessfully");
    } catch (error){
        return res.status(500).json(error);
    }

    
})

router.route("/agg/:empid").post(async(req,res)=>{
  console.log("agg/empid")
    const empid = req.params.empid;
    console.log(empid)
    const period = req.body.time;
    console.log(period);
    console.log(empid);
    let time;
    if (period == 'week'){
       time = 7*24*60*60*1000;
    }else if(period == 'year'){
       time = 365*24*60*60*1000;
    }else if(period == 'month'){
       time = 30*24*60*60*1000;
    }else{
      time = 100*365*24*60*60*1000;
    }
    
      const sdate = new Date();
      const edate = new Date(sdate.getTime() - (time)) ;
      console.log(sdate.toISOString());
      console.log(edate.toISOString());
      try{
        const pipeline =[
          {
            '$match': {
              'empid': empid,
              'date': {
                $gte: edate,
                $lt: sdate
              }
            }
          }, {
            '$group': {
              '_id': '$empid', 
              'totalYieldDry': {
                '$sum': '$YieldDry'
              }, 
              'totalYieldCutsWet': {
                '$sum': '$YieldCutsWet'
              }, 
              'totalGrade_A_Cuts': {
                '$sum': '$Grade_A_Cuts'
              }, 
              'totalGrade_B_Cuts': {
                '$sum': '$Grade_B_Cuts'
              }, 
              'totalGrade_C_Cuts': {
                '$sum': '$Grade_C_Cuts'
              }, 
              'totalGrade_F_Cuts': {
                '$sum': '$Grade_F_Cuts'
              }, 
              'averageScore': {
                '$avg': '$score'
              }
            }
          }, {
            '$lookup': {
              'from': 'employees', 
              'localField': '_id', 
              'foreignField': 'empid', 
              'as': 'result'
            }
          }, {
            '$unwind': {
              'path': '$result'
            }
          }, {
            '$project': {
              '_id': 0, 
              'empid': '$_id', 
              'Name': '$result.fname', 
              'Group': '$result.Group', 
              'Line': '$result.Line', 
              'totalYieldDry': 1, 
              'totalYieldCutsWet': 1, 
              'totalGrade_A_Cuts': 1, 
              'totalGrade_B_Cuts': 1, 
              'totalGrade_C_Cuts': 1, 
              'totalGrade_F_Cuts': 1, 
              'averageScore': 1, 
              'documents': 1
            }
          }
        ];
          const result = await records.aggregate(pipeline);
          console.log(result)
          res.json(result);
    }catch (error){
        console.log(error);
        res.status(500).json({error:"internal server error"});
    }
    
    
    
})
router.route("/agg").post(authMiddleware2,async(req,res)=>{
  console.log("hhhhh")
  const id = req.body.employeeId;
  const period = req.body.time;
  console.log(period);
  console.log(id);
  let time;
  if (period == 'week'){
     time = 7*24*60*60*1000;
  }else if(period == 'year'){
     time = 365*24*60*60*1000;
  }else if(period == 'month'){
     time = 30*24*60*60*1000;
  }else{
    time = 100*365*24*60*60*1000;
  }
  
    const sdate = new Date();
    const edate = new Date(sdate.getTime() - (time)) ;
    console.log(sdate.toISOString());
    console.log(edate.toISOString());
    try{

      const employee = await Employee.findOne({ _id: id });
      
      console.log("aaaa")
      console.log(id)
      console.log(employee.empid)
      const pipeline =[
        {
          '$match': {
            'empid': employee.empid,
            'date': {
              $gte: edate,
              $lt: sdate
            }
          }
        }, {
          '$group': {
            '_id': '$empid', 
            'totalYieldDry': {
              '$sum': '$YieldDry'
            }, 
            'totalYieldCutsWet': {
              '$sum': '$YieldCutsWet'
            }, 
            'totalGrade_A_Cuts': {
              '$sum': '$Grade_A_Cuts'
            }, 
            'totalGrade_B_Cuts': {
              '$sum': '$Grade_B_Cuts'
            }, 
            'totalGrade_C_Cuts': {
              '$sum': '$Grade_C_Cuts'
            }, 
            'totalGrade_F_Cuts': {
              '$sum': '$Grade_F_Cuts'
            }, 
            'averageScore': {
              '$sum': '$score'
            }
          }
        }, {
          '$lookup': {
            'from': 'employees', 
            'localField': '_id', 
            'foreignField': 'empid', 
            'as': 'result'
          }
        }, {
          '$unwind': {
            'path': '$result'
          }
        }, {
          '$project': {
            '_id': 0, 
            'empid': '$_id', 
            'Name': '$result.fname', 
            'Group': '$result.Group', 
            'Line': '$result.Line', 
            'totalYieldDry': 1, 
            'totalYieldCutsWet': 1, 
            'totalGrade_A_Cuts': 1, 
            'totalGrade_B_Cuts': 1, 
            'totalGrade_C_Cuts': 1, 
            'totalGrade_F_Cuts': 1, 
            'averageScore': 1, 
            'documents': 1
          }
        }
      ];
        const result = await records.aggregate(pipeline);
        
        res.json(result);
  }catch (error){
      console.log(error);
      res.status(500).json({error:"internal server error"});
  }
  
  
  
})



router.route("/").post(async(req,res)=>{
    const empid = req.body.inputValue;
    try{
        const pipeline = [
            {
              '$match': {
                'empid': empid
              }
            }
          ];
          const result = await records.aggregate(pipeline);
          res.json(result);
    }catch (error){
        console.log(error);
        res.status(500).json({error:"internal server error"});
    }
    
})


router.route("/weekly").post((req,res)=>{
    const empid = req.body.inputValue;
    const period = req.body.time;
    console.log(empid)
    console.log(period);
    let sdate;
    let edate;
    if (period == 'week') {
         sdate = new Date();
         edate = new Date(sdate.getTime() - (7*24*60*60*1000)) ;
        console.log(sdate.toISOString());
        console.log(edate.toISOString());
  
    } else if(period == 'month') {
         sdate = new Date();
         edate = new Date(sdate.getTime() - (30*24*60*60*1000)) ;
        console.log(sdate.toISOString());
        console.log(edate.toISOString());

    } else if(period == 'year'){
         sdate = new Date();
         edate = new Date(sdate.getTime() - (365*24*60*60*1000)) ;
        console.log(sdate.toISOString());
        console.log(edate.toISOString());
    } else {

        sdate = new Date();
        edate = new Date(sdate.getTime() - (1000*365*24*60*60*1000)) ;
        console.log(sdate.toISOString());
        console.log(edate.toISOString());

    }

      records.find({
      empid:empid,
      date:{
          $gte :edate,
          $lte: sdate
      }
  }).sort({date:-1}).then((record)=>{
      //res.json(record)
      res.status(200).send({success: true , record:record});
  }).catch((err)=>{
      console.log(err);
      res.status(500).send({ message: "error", success: false, err });
  })
    
})

router.route("/setinditarget").post(async (req, res) => {
  let empid = req.body.empid;
  let target = Number(req.body.target);

  

  const newTarget = new Targetm({ empid, target });

  try {
    
    await newTarget.save();
    res.status(200).send("Target set successfully.");
  } catch (err) {
    
    console.error(err);
    res.status(500).send("Error setting target.");
  }
});

router.route("/settarget").post(async (req, res) => {
  //let empid = req.body.empid;
  let target = Number(req.body.target);
 

  const pipeline1 = [{
    $match: {
      jobRole: "factory worker"
    }
  },
  {
    $project: {
      _id: 0,
      empid: 1
    }
  }];
  const result = await Employee.aggregate(pipeline1);
  
  const empIds = result.map(emp => emp.empid);
  console.log(empIds)

  

  try {
    const insertPromises = empIds.map(empId => {
      return Targetm.create({ empid: empId});
    });
    await Promise.all(insertPromises);
    res.status(200).send("Target set successfully.");
  } catch (err) {
  
    console.error(err);
    res.status(500).send("Error setting target.");
  }

  
  const result1 = await Targetm.updateMany(
    {
      empid: { $in: empIds }
    },
    {
      $set: {
        target : target
        
      }
    }
  )
  

  
});

router.route("/targetget").get(async (req,res) => {
    
  const id = req.body.employeeId;
  
try{
  const result = await Targetm.findOne();
  console.log(result);
  res.json(result);
  
}catch (err) {
  // Handle any errors that occur during saving
  console.error(err);
  res.status(500).send("Error fetching target.");
}



})

router.route("/gettargetempid").get(authMiddleware2,async (req,res) => {
    
    const id = req.body.employeeId;
    


    const employee = await Employee.findOne({ _id: id });
      
      console.log("aaaa")
      console.log(id)
      console.log(employee.empid)

      const empid = employee.empid;
  try{
    const result = await Targetm.findOne({empid : empid});
    console.log(result);
    res.json(result);
    
  }catch (err) {
    // Handle any errors that occur during saving
    console.error(err);
    res.status(500).send("Error fetching target.");
  }
  
 

})

router.route("/deletetarget").delete(async (req, res) => {
  //let empid = req.body.empid;
  //let target = Number(req.body.target);
 console.log("delete goal")

  const pipeline1 = [{
    $match: {
      jobRole: "factory worker"
    }
  },
  {
    $project: {
      _id: 0,
      empid: 1
    }
  }];
  const result = await Employee.aggregate(pipeline1);
  
  const empIds = result.map(emp => emp.empid);
  console.log(empIds)

  

  try {
    const deleteResult = await Targetm.deleteMany({ empid: { $in: empIds } });
    res.status(200).send("Targets deleted successfully.");
  } catch (err) {
    // Handle any errors that occur during saving
    console.error(err);
    res.status(500).send("Error deleting target.");
  }

  
  
  

  
});
router.route("/targetcurrentscore").get(authMiddleware2,async (req,res) => {

  const id = req.body.employeeId;
  const employee = await Employee.findOne({ _id: id });
  if(employee.jobRole != "factory worker"){

    console.log("Not a factory worker")

  }else{

    console.log("aaaa")
  console.log(id)
  console.log(employee.empid)
  const empid = employee.empid;

  const result1 = await Targetm.findOne({empid : empid});
  console.log("llllllllojhgg")
console.log(result1)
  if(result1){
    console.log(result1);
    
    console.log("target");
    console.log(result1.date);
    console.log(result1.endDate)
  
    const sdate = result1.date;
    const edate = result1.endDate;
  
    try{
    const pipeline =[
      {
        '$match': {
          'empid': employee.empid,
          'date': {
            $gte: sdate,
            $lt: edate
          }
        }
      }, {
        '$group': {
          '_id': '$empid', 
          'totalYieldDry': {
            '$sum': '$YieldDry'
          }, 
          'totalYieldCutsWet': {
            '$sum': '$YieldCutsWet'
          }, 
          'totalGrade_A_Cuts': {
            '$sum': '$Grade_A_Cuts'
          }, 
          'totalGrade_B_Cuts': {
            '$sum': '$Grade_B_Cuts'
          }, 
          'totalGrade_C_Cuts': {
            '$sum': '$Grade_C_Cuts'
          }, 
          'totalGrade_F_Cuts': {
            '$sum': '$Grade_F_Cuts'
          }, 
          'averageScore': {
            '$sum': '$score'
          }
        }
      }, {
        '$lookup': {
          'from': 'employees', 
          'localField': '_id', 
          'foreignField': 'empid', 
          'as': 'result'
        }
      }, {
        '$unwind': {
          'path': '$result'
        }
      }, {
        '$project': {
          '_id': 0, 
          'empid': '$_id', 
          'Name': '$result.fname', 
          'Group': '$result.Group', 
          'Line': '$result.Line', 
          'totalYieldDry': 1, 
          'totalYieldCutsWet': 1, 
          'totalGrade_A_Cuts': 1, 
          'totalGrade_B_Cuts': 1, 
          'totalGrade_C_Cuts': 1, 
          'totalGrade_F_Cuts': 1, 
          'averageScore': 1, 
          'documents': 1
        }
      }
    ];
      const result = await records.aggregate(pipeline);
      console.log(result)
      res.json(result);
  }catch(error){
          console.log(error);
          res.status(500).json({error:"internal server error"});
  }
  }else{
   console.log("no targets")
  }
  
  }
  

});
router.route("/update/:id").put(async (req,res)=>{
    let empid = req.params.id;
    console.log(empid)
    const YieldDry = Number(req.body.YieldDry);
    const YieldCutsWet = Number(req.body.YieldCutsWet);
    const Grade_A_Cuts = Number(req.body.Grade_A_Cuts);
    const Grade_B_Cuts = Number(req.body.Grade_B_Cuts);
    const Grade_C_Cuts = Number(req.body.Grade_C_Cuts);
    const Grade_F_Cuts = Number(req.body.Grade_F_Cuts);
    const score = Number(YieldCutsWet * 0.5 +YieldDry * 0.5 +Grade_A_Cuts * 1 +Grade_B_Cuts * 0.8 +Grade_C_Cuts * 0.5 -Grade_F_Cuts * 1);

    const updateRecord = {
        YieldDry,
        YieldCutsWet,
        Grade_A_Cuts, 
        Grade_B_Cuts,
        Grade_C_Cuts,
        Grade_F_Cuts,
        score


    }

    const update = await performance_record.findByIdAndUpdate(empid,updateRecord).then(()=>
    res.status(200).send({status:"record updated"})
    ).catch((err)=>{
        console.log(err);
    });

    
})

router.route("/getrecordg/:id").get(async(req,res)=>{
    let id = req.params.id;
    try {
        const result = await records.findById({_id: id});
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"internal server error"})
    }
    
})

router.route("/getrecord/:id").get(async(req,res)=>{
  let id = req.params.id;
  console.log(id)
  try {
      const result = await records.aggregate([
        [
          {
            '$match': {
              '_id': new mongoose.Types.ObjectId(id)
            }
          }, {
            '$lookup': {
              'from': 'employees', 
              'localField': 'empid', 
              'foreignField': 'empid', 
              'as': 'result'
            }
          }, {
            '$unwind': {
              'path': '$result'
            }
          }, {
            '$project': {
              '_id': 1, 
              'name': '$result.fname', 
              'empid': 1, 
              'Group': 1, 
              'Line': 1, 
              'YieldDry': 1, 
              'YieldCutsWet': 1, 
              'Grade_A_Cuts': 1, 
              'Grade_B_Cuts': 1, 
              'Grade_C_Cuts': 1, 
              'Grade_F_Cuts': 1, 
              'date': 1, 
              'score': 1
            }
          }
        ]
      ])
      
      res.json(result);
  } catch (error) {
      console.log(error);
      res.status(500).json({error:"internal server error"})
  }
  
})

router.route("/allrecords").get(async(req,res)=>{
  
  try {
    const result = await records.aggregate([
      { $group: { _id: '$empid', records: { $push: '$$ROOT' } } }
    ]);
      res.json(result);
  } catch (error) {
      console.log(error);
      res.status(500).json({error:"internal server error"})
  }
  
})


router.route("/allemployees").get(rewardassignmiddleware,async(req,res)=>{
  const id = req.body.employeeId;
  console.log(id);
  console.log("dfdfdfdfdfdfdfdfdfd");

  


  try{
    const result = await records.aggregate([
      {
        '$group': {
          '_id': '$empid', 
          'totalscore': {
            '$sum': '$score'
          }
        }
      }, {
        '$sort': {
          'totalscore': -1
        }
      },{
        '$lookup': {
          'from': 'employees', 
          'localField': '_id', 
          'foreignField': 'empid', 
          'as': 'result'
        }
      }, {
        '$unwind': {
          'path': '$result'
        }
      },{
        '$project': {
          '_id': 1, 
          'empid': '$_id', 
          'Name': '$result.fname', 
          'Group': '$result.Group', 
          'Line': '$result.Line', 
          'totalYieldDry': 1, 
          'totalYieldCutsWet': 1, 
          'totalGrade_A_Cuts': 1, 
          'totalGrade_B_Cuts': 1, 
          'totalGrade_C_Cuts': 1, 
          'totalGrade_F_Cuts': 1, 
          'totalscore': 1, 
          'documents': 1
        }
      }
    
    ]);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"internal server error"})
}
})



router.route("/rank5").get(rewardassignmiddleware,async(req,res)=>{
  const id = req.body.employeeId;
  console.log(id);
  console.log("dfdfdfdfdfdfdfdfdfd")

  


  try{
    const result = await records.aggregate([
      {
        '$group': {
          '_id': '$empid', 
          'totalscore': {
            '$sum': '$score'
          }
        }
      }, {
        '$sort': {
          'totalscore': -1
        }
      }, {
        '$limit': 5
      },{
        '$lookup': {
          'from': 'employees', 
          'localField': '_id', 
          'foreignField': 'empid', 
          'as': 'result'
        }
      }, {
        '$unwind': {
          'path': '$result'
        }
      },{
        '$project': {
          '_id': 1, 
          'empid': '$_id', 
          'Name': '$result.fname', 
          'Group': '$result.Group', 
          'Line': '$result.Line', 
          'totalYieldDry': 1, 
          'totalYieldCutsWet': 1, 
          'totalGrade_A_Cuts': 1, 
          'totalGrade_B_Cuts': 1, 
          'totalGrade_C_Cuts': 1, 
          'totalGrade_F_Cuts': 1, 
          'totalscore': 1, 
          'documents': 1
        }
      }
    
    ]);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"internal server error"})
}
})
router.route("/goalprogress").get(async(req,res)=>{
   const i = -1;
  
    const result1 = await Targetm.findOne();
    console.log(result1);
      
    console.log("target");
    console.log(result1.date);
    console.log(result1.endDate)
  
    const sdate = result1.date;
    const edate = result1.endDate;
  

      
 
  try{
    const result = await records.aggregate([
      {
        '$match': {
          'date': {
            $gte: sdate,
            $lt: edate
          }
        }
      }, {
          '$group': {
          '_id': '$empid', 
          'totalscore': {
            '$sum': '$score'
          }
        }}
      , {
        '$sort': {
          'totalscore': i
        }
      },{
        '$lookup': {
          'from': 'employees', 
          'localField': '_id', 
          'foreignField': 'empid', 
          'as': 'result'
        }
      }, {
        '$unwind': {
          'path': '$result'
        }
      },{
        '$project': {
          '_id': 1, 
          'empid': '$_id', 
          'Name': '$result.fname', 
          'totalscore': 1, 
          
        }
      }
    
    
    ]);
    console.log(result)
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"internal server error"})
}
})

router.route("/delete/:id").delete(async (req,res) => {
  const id = req.params.id;

  try{

    const deleteRecord = await records.findByIdAndDelete(id);

    if (!deleteRecord) {
     
      return res.status(404).json({ error: "Record not found" });
    }

   
    res.json({ message: "Record deleted successfully", deleteRecord });

    
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
})



//minukge eka test karnna okkoma records gatta
router.route("/qqqq").get(async(req,res)=>{
  
  try {
      const result = await records.find();
      res.json(result);
  } catch (error) {
      console.log(error);
      res.status(500).json({error:"internal server error"})
  }
  
});

router.route("/createRewards").post(async(req,res)=>{

  const RewardName = req.body.RewardName;
  const RewardID = req.body.RewardID;
  const place = req.body.place;
  console.log(RewardName)


  //const result = await Employee.find({jobRole:"worker"}).select("empid -_id")
  //console.log(result)
  // empIDs = result.map(emp => emp.empid);
  //console.log(empIDs)

  try{
    const insertPromises = await Reward.create({ Name: RewardName , RewardID:RewardID,place:place});
    



    res.status(200).send({message:"Reward set sucessfully",sucess:true,Data : insertPromises})
  }catch(err){
    console.log(err)
    res.status(500).send({message:"Fail"})
  }
  //res.json(empIds);
});

router.route("/specialrewards").post(async(req,res)=>{

  const RewardName = req.body.RewardName;
  const RewardID = req.body.RewardID;
  const empid = req.body.empid;
  console.log(RewardName)


  //const result = await Employee.find({jobRole:"worker"}).select("empid -_id")
  //console.log(result)
  // empIDs = result.map(emp => emp.empid);
  //console.log(empIDs)

  try{
    const insertPromises = await Reward.create({ Name: RewardName , RewardID:RewardID,empid:empid});
    



    res.status(200).send({message:"Reward set sucessfully",sucess:true,Data : insertPromises})
  }catch(err){
    console.log(err)
    res.status(500).send({message:"Fail"})
  }
  //res.json(empIds);
})


router.route("/deleteReward/:id").delete(async(req,res) =>{
  const RewardId = req.params.id;
  console.log("rewardID",RewardId)
  try{
    const result = await Reward.findByIdAndDelete(RewardId);
    console.log(result)
    res.status(200).send({message:"Reward deleted"});
  }catch(err){
    console.log("err")
    res.status(500).send({message:err})
  }
});

router.route("/empwithreward").get(rewardassignmiddleware,async(req,res) => {
  try{
    const rewardlist = await Reward.find();
    console.log(rewardlist)
    res.status(200).send({rewards:rewardlist})
  }catch(err){
    res.status(500).send({Message:err})
}
})

//employee table eken logweddi values gannawa

router.post('/get-employee-info-by-id', authMiddleware2, async (req, res) => {
  try {
      const employee = await Employee.findOne({ _id: req.body.employeeId });
      if (!employee) {
          return res.status(200).send({ message: "Employee does not exist", success: false });
      } else {

          const { isAdmin, isDoctor, isAnnHrsup, isLeaveHrsup, islogisticsMan, isuniform, isinsu, isinquiry, isperfomace, seenNotifications, unseenNotifications } = employee;




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
             
          } });
      }
  } catch (error) {
      res.status(500).send({ message: "Error getting user info", success: false, error });
  }
});

//pdf generate

router.route('/generate_perpdf').post(authMiddleware2, async (req, res) => {
  console.log("qqqqqqqqqqqqqqqqqqqqqqqq")
    try {
      

    
          const id = req.body.employeeId;
          console.log(id)
          const period = req.body.time;
          console.log(period);
          console.log(id);
          let time;
          if (period == 'week'){
             time = 7*24*60*60*1000;
          }else if(period == 'year'){
             time = 365*24*60*60*1000;
          }else if(period == 'month'){
             time = 30*24*60*60*1000;
          }else{
            time = 100*365*24*60*60*1000;
          }
          
            const sdate = new Date();
            const edate = new Date(sdate.getTime() - (time)) ;
            console.log(sdate.toISOString());
            console.log(edate.toISOString());

            const employee = await Employee.findOne({ _id: id });
            console.log(employee.empid)

            
              const pipeline =[
                {
                  '$match': {
                    'empid': employee.empid,
                    'date': {
                      $gte: edate,
                      $lt: sdate
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$empid', 
                    'totalYieldDry': {
                      '$sum': '$YieldDry'
                    }, 
                    'totalYieldCutsWet': {
                      '$sum': '$YieldCutsWet'
                    }, 
                    'totalGrade_A_Cuts': {
                      '$sum': '$Grade_A_Cuts'
                    }, 
                    'totalGrade_B_Cuts': {
                      '$sum': '$Grade_B_Cuts'
                    }, 
                    'totalGrade_C_Cuts': {
                      '$sum': '$Grade_C_Cuts'
                    }, 
                    'totalGrade_F_Cuts': {
                      '$sum': '$Grade_F_Cuts'
                    }, 
                    'averageScore': {
                      '$sum': '$score'
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'employees', 
                    'localField': '_id', 
                    'foreignField': 'empid', 
                    'as': 'result'
                  }
                }, {
                  '$unwind': {
                    'path': '$result'
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'empid': '$_id', 
                    'Name': '$result.fname', 
                    'Group': '$result.Group', 
                    'Line': '$result.Line', 
                    'totalYieldDry': 1, 
                    'totalYieldCutsWet': 1, 
                    'totalGrade_A_Cuts': 1, 
                    'totalGrade_B_Cuts': 1, 
                    'totalGrade_C_Cuts': 1, 
                    'totalGrade_F_Cuts': 1, 
                    'averageScore': 1, 
                    'documents': 1
                  }
                }
              ];
                const result = await records.aggregate(pipeline);
                console.log(result)
                console.log("kkkkk")
                console.log(result[0].Name)

         
          
          
      
  
      if (!result) {
        return res.status(404).json({ success: false, message: 'Performance details not found' });
      }
  
      // Create a new PDF document
      const doc = new PDFDocument();

      const borderWidth = 10;
      doc.rect(borderWidth, borderWidth, doc.page.width - 2 * borderWidth, doc.page.height - 2 * borderWidth).stroke();
  
      // Pipe the PDF content to the response
      doc.pipe(res);

      // Load the logo image
      const logoPath = path.join(__dirname, '../images/logo.png');
      const logoData = fs.readFileSync(logoPath);

      // Calculate the width of the logo image
      const logoWidth = 100;

      // Calculate the position to center the logo image horizontally
      const centerX = (doc.page.width - logoWidth) / 2;

      // Add the logo image to the top of the document
      doc.image(logoData, centerX, 50, { width: logoWidth});

      doc.y = 150;
      doc.fontSize(24).text(`Performance Details Report for a ${period} `, { align: 'center' });

      doc.moveDown();
      doc.moveDown();
      
      // Add content to the PDF
       // Add the name with some space below
       doc.fontSize(16).text(`Name                        : ${result[0].Name}`).moveDown(0.5);

       // Add the Employee ID with some space below
       doc.fontSize(16).text(`Employee ID              : ${result[0].empid}`).moveDown(0.5);

       // Add the insurance number with some space below
       doc.fontSize(16).text(`Yield Dry Weight        : ${Math.round(result[0].totalYieldDry)}`).moveDown(0.5);

       // Add the phone number with some space below
       doc.fontSize(16).text(`Yield Cuts Wet           : ${Math.round(result[0].totalYieldCutsWet)}`).moveDown(0.5);

       // Add the description with some space below
       doc.fontSize(16).text(`Grade A Cuts             : ${result[0].totalGrade_A_Cuts}`).moveDown(0.5);

       // Add the file with some space below
       doc.fontSize(16).text(`Grade B Cuts             : ${result[0].totalGrade_B_Cuts}`).moveDown(0.5);

       // Add the status with some space below
       doc.fontSize(16).text(`Grade C Cuts             : ${result[0].totalGrade_C_Cuts}`).moveDown(0.5);

       doc.fontSize(16).text(`Grade F Cuts             : ${result[0].totalGrade_F_Cuts}`).moveDown(0.5);

       doc.fontSize(16).text(`Score                         : ${Math.round(result[0].averageScore)}`).moveDown(0.5);



      // End the document
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  });

  router.route('/generate_perpdf/:empid').post( async (req, res) => {
    console.log("qqqqqqqqqqqqqqqqqqqqqqqq")
    empid = req.params.empid;
    console.log(empid)
      try {
        
  
      
            const period = req.body.time;
            console.log(period);
            let time;
            if (period == 'week'){
               time = 7*24*60*60*1000;
            }else if(period == 'year'){
               time = 365*24*60*60*1000;
            }else if(period == 'month'){
               time = 30*24*60*60*1000;
            }else{
              time = 100*365*24*60*60*1000;
            }
            
              const sdate = new Date();
              const edate = new Date(sdate.getTime() - (time)) ;
              console.log(sdate.toISOString());
              console.log(edate.toISOString());
  
             
              
                const pipeline =[
                  {
                    '$match': {
                      'empid':empid,
                      'date': {
                        $gte: edate,
                        $lt: sdate
                      }
                    }
                  }, {
                    '$group': {
                      '_id': '$empid', 
                      'totalYieldDry': {
                        '$sum': '$YieldDry'
                      }, 
                      'totalYieldCutsWet': {
                        '$sum': '$YieldCutsWet'
                      }, 
                      'totalGrade_A_Cuts': {
                        '$sum': '$Grade_A_Cuts'
                      }, 
                      'totalGrade_B_Cuts': {
                        '$sum': '$Grade_B_Cuts'
                      }, 
                      'totalGrade_C_Cuts': {
                        '$sum': '$Grade_C_Cuts'
                      }, 
                      'totalGrade_F_Cuts': {
                        '$sum': '$Grade_F_Cuts'
                      }, 
                      'averageScore': {
                        '$sum': '$score'
                      }
                    }
                  }, {
                    '$lookup': {
                      'from': 'employees', 
                      'localField': '_id', 
                      'foreignField': 'empid', 
                      'as': 'result'
                    }
                  }, {
                    '$unwind': {
                      'path': '$result'
                    }
                  }, {
                    '$project': {
                      '_id': 0, 
                      'empid': '$_id', 
                      'Name': '$result.fname', 
                      'Group': '$result.Group', 
                      'Line': '$result.Line', 
                      'totalYieldDry': 1, 
                      'totalYieldCutsWet': 1, 
                      'totalGrade_A_Cuts': 1, 
                      'totalGrade_B_Cuts': 1, 
                      'totalGrade_C_Cuts': 1, 
                      'totalGrade_F_Cuts': 1, 
                      'averageScore': 1, 
                      'documents': 1
                    }
                  }
                ];
                  const result = await records.aggregate(pipeline);
                  console.log(result)
                  console.log("kkkkk")
                  console.log(result[0].Name)
  
           
            
            
        
    
        if (!result) {
          return res.status(404).json({ success: false, message: 'Performance details not found' });
        }
    
        // Create a new PDF document
        const doc = new PDFDocument();
  
        const borderWidth = 10;
        doc.rect(borderWidth, borderWidth, doc.page.width - 2 * borderWidth, doc.page.height - 2 * borderWidth).stroke();
    
        // Pipe the PDF content to the response
        doc.pipe(res);
  
        // Load the logo image
        const logoPath = path.join(__dirname, '../images/logo.png');
        const logoData = fs.readFileSync(logoPath);
  
        // Calculate the width of the logo image
        const logoWidth = 100;
  
        // Calculate the position to center the logo image horizontally
        const centerX = (doc.page.width - logoWidth) / 2;
  
        // Add the logo image to the top of the document
        doc.image(logoData, centerX, 50, { width: logoWidth});
  
        doc.y = 150;
        doc.fontSize(24).text(`Performance Details Report for a ${period} `, { align: 'center' });
  
        doc.moveDown();
        doc.moveDown();
        
        // Add content to the PDF
         // Add the name with some space below
         doc.fontSize(16).text(`Name                        : ${result[0].Name}`).moveDown(0.5);
  
         // Add the Employee ID with some space below
         doc.fontSize(16).text(`Employee ID              : ${result[0].empid}`).moveDown(0.5);
  
         // Add the insurance number with some space below
         doc.fontSize(16).text(`Yield Dry Weight        : ${Math.round(result[0].totalYieldDry)}`).moveDown(0.5);
  
         // Add the phone number with some space below
         doc.fontSize(16).text(`Yield Cuts Wet           : ${Math.round(result[0].totalYieldCutsWet)}`).moveDown(0.5);
  
         // Add the description with some space below
         doc.fontSize(16).text(`Grade A Cuts             : ${result[0].totalGrade_A_Cuts}`).moveDown(0.5);
  
         // Add the file with some space below
         doc.fontSize(16).text(`Grade B Cuts             : ${result[0].totalGrade_B_Cuts}`).moveDown(0.5);
  
         // Add the status with some space below
         doc.fontSize(16).text(`Grade C Cuts             : ${result[0].totalGrade_C_Cuts}`).moveDown(0.5);
  
         doc.fontSize(16).text(`Grade F Cuts             : ${result[0].totalGrade_F_Cuts}`).moveDown(0.5);
  
         doc.fontSize(16).text(`Score                         : ${Math.round(result[0].averageScore)}`).moveDown(0.5);
  
  
  
        // End the document
        doc.end();
      } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
      }
    });






module.exports =router;