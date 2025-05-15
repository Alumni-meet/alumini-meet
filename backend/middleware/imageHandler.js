const multer = require("multer");

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Creates Multer middleware for specified file fields
 * @param {Array} fields - Array of field configurations (name and maxCount)
 */
const createFileUploadMiddleware = (fields) => {
  return upload.fields(fields);
};

/**
 * Processes uploaded files and returns formatted image data
 * @param {Object} req - Express request object
 * @param {String} fieldName - Name of the file field (e.g., "eventImg")
 * @returns {Object|null} Image data object or null if no file found
 */
const processUploadedFile = (req, fieldName) => {
  if (
    !req.files ||
    !req.files[fieldName] ||
    req.files[fieldName].length === 0
  ) {
    return null;
  }

  const file = req.files[fieldName][0];
  return {
    data: file.buffer,
    contentType: file.mimetype,
  };
};

/**
 * Sends image response with proper headers
 * @param {Object} res - Express response object
 * @param {Object} imageData - Image data object from database
 */
const sendImageResponse = (res, imageData) => {
  if (!imageData || !imageData.data) {
    return res.status(404).json({ message: "Image not found" });
  }

  res.set("Content-Type", imageData.contentType);
  res.send(imageData.data);
};

module.exports = {
  createFileUploadMiddleware,
  processUploadedFile,
  sendImageResponse,
};
