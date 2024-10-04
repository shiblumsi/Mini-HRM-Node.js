const catchAsync = require("../utils/catchAsync");
const {prisma} = require('../DB/db.config');
const AppError = require("../utils/appError");

exports.createDepartment = catchAsync(async (req, res, next)=>{
    const {name, description} = req.body
    const dep = await prisma.department.create({
        data:{
            name,
            description
        }
    })
    if(!dep){
        return next(new AppError("No department Created!", 400))
    }
    return res.status(201).json({
        status:'success',
        data:dep
    })
})