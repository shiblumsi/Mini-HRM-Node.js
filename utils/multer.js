const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Utility function to create directories if they don't exist
const ensureDirectoryExistence = (dirPath, cb) => {
  fs.access(dirPath, (error) => {
    if (error) {
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          return cb(err); // Pass the error to the callback
        }
        cb(null, dirPath); // If successful, pass the directory to the callback
      });
    } else {
      cb(null, dirPath); // Directory exists, proceed
    }
  });
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadBaseDir = `uploads/employee/${req.params.id}`;
    let uploadDir;

    // Determine the folder based on MIME type
    if (file.mimetype.startsWith('image/')) {
      uploadDir = `${uploadBaseDir}/images`;
    } else if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('application/')
    ) {
      uploadDir = `${uploadBaseDir}/documents`;
    } else {
      return cb(
        new Error(
          'Invalid file type. Only images and documents (PDF, DOC) are allowed.'
        )
      );
    }

    // Ensure the directory exists before saving the file
    ensureDirectoryExistence(uploadDir, cb);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});

module.exports = upload;
