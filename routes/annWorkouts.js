const express=require('express') 
 
const router= express.Router()

router.get('/',(req,res)=>{ 
    res.json({mssg:'GET all workouts '})//get workouts
})

//get a single wokrout
router.get('/:id',(req,res)=>{
    res.json({mssg:'GET a single workout'})
})

//POST a new workout
router.post('/',(req,res)=>{
    res.json({mssg:'POST a new workout'})
})

//delete a workout
router.delete('/:id',(req,res)=>{
    res.json({mssg:'DELETE a workout'})
})

//updatea workout
router.patch ('/:id',(req,res)=>{
    res.json({mssg:'UPDATE a workout'})
})

module.exports= router 