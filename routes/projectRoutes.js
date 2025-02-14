const express = require("express");
const { getProjects, createProject, deleteProject, updateProject, uploadProjectImage, upload } = require("../controllers/projectController");

const router = express.Router();

console.log("📌 Project routes initialized");

router.get("/", (req, res) => {
  console.log("📢 GET /api/projects called");
  getProjects(req, res);
});

router.post("/", (req, res) => {
  console.log("📢 POST /api/projects called");
  createProject(req, res);
});

router.put("/:id", updateProject);

// **Pastikan upload.single() tidak error**
router.post("/upload", upload.single("image"), uploadProjectImage);

router.delete("/:id", (req, res) => {
  console.log("📢 DELETE /api/projects/:id called");
  deleteProject(req, res);
});

module.exports = router;
