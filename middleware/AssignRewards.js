const records = require("../models/per_performance_record");
const Reward = require("../models/per_Reward")

module.exports = async(req,res,next) =>{

const first3ranks = await records.aggregate([
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
      '$limit': 3
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
        '_id': 0, 
        'empid': '$_id' 
      }
    }
  
  ]);
  console.log("first 3 ranks")
  console.log(first3ranks);
  const empIDs = first3ranks.map(emp => emp.empid);
  console.log(empIDs[0])
  console.log(empIDs[1])
  console.log(empIDs[2])

  await Promise.all([
    Reward.updateOne({RewardID: "R001"}, {$set:{empid: empIDs[0]}}),
    Reward.updateOne({RewardID: "R002"}, {$set:{empid: empIDs[1]}}),
    Reward.updateOne({RewardID: "R003"}, {$set:{empid: empIDs[2]}})
]);



next();
};