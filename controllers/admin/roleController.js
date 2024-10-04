const catchAsync = require("../../utils/catchAsync");
const {prisma} = require('../../DB/db.config');
const AppError = require("../../utils/appError");

exports.createRole = catchAsync(async (req, res, next)=>{
    const {role} = req.body
    const newRole = await prisma.role.create({
        data:{
            role
        }
    })
    if(!newRole){
        return next(new AppError("No role Created!", 400))
    }
    return res.status(201).json({
        status:'success',
        data:newRole
    })
})