const { prisma } = require("./DB/db.config");



exports.calculateGrossSalary = async (basicSalaryId, houseAllowance, medicalAllowance, otherAllowance, deductions, overtimeHours, overtimeRate) => {
    // Fetch the basic salary amount from the database
    const basicSalaryRecord = await prisma.basicSalary.findUnique({
        where: {
            id: basicSalaryId,
        },
    });

    // Check if the basic salary record exists
    if (!basicSalaryRecord) {
        throw new Error('Basic salary not found');
    }

    const basicSalary = basicSalaryRecord.amount;

    // Calculate overtime pay
    const overtimePay = overtimeHours * overtimeRate;

    // Calculate gross salary
    const grossSalary = basicSalary
        + (houseAllowance || 0) 
        + (medicalAllowance || 0) 
        + (otherAllowance || 0) 
        + (overtimePay || 0) 
        - (deductions || 0);

    return grossSalary;
};