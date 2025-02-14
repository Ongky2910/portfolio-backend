const express = require("express");
const { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  uploadProjectImage, 
  upload 
} = require("../controllers/projectController");

const router = express.Router();

console.log("📌 Project routes initialized");

router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// **Upload gambar**
router.post("/upload", upload.single("image"), uploadProjectImage);

module.exports = router;
