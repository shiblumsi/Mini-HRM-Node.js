const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Utility function to create directories if they don't exist
const ensureDirectoryExistence = (dirPath, cb) => {
  fs.access(dirPath, (error) => {
    if (error) {
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          return cb(err); 
        }
        cb(null, dirPath); // If successful, pass the directory to the callback
      });
    } else {
      cb(null, dirPath); // Directory exists, proceed
    }
  });
};

// Set up multer storage for application uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { jobId } = req.params; // Assuming jobId is passed in the request params
    let uploadDir;

    // Determine the folder based on the field name
    if (file.fieldname === 'resume') {
      uploadDir = `uploads/applications/${jobId}/resume`;
    } else if (file.fieldname === 'coverLetter') {
      uploadDir = `uploads/applications/${jobId}/coverLetter`;
    } else {
      return cb(new Error('Invalid file type. Only resume and cover letter are allowed.'));
    }

    // Ensure the directory exists before saving the file
    ensureDirectoryExistence(uploadDir, cb);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'));
    }
  },
}).fields([
  { name: 'resume', maxCount: 1 },  // Allow one resume
  { name: 'coverLetter', maxCount: 1 } // Allow one cover letter
]);

module.exports = upload;
