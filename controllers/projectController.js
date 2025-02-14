const mongoose = require("mongoose");
const Project = require("../models/Project");
const multer = require("multer");
const path = require("path");
const Joi = require("joi");
const cloudinary = require("../config/cloudinaryConfig");


// 🛠️ Middleware Validasi Input
const validateProject = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    technologies: Joi.array().items(Joi.string()).min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

// 📌 Get all projects with pagination, search, and sorting
exports.getProjects = async (req, res) => {
  try {
    let { page, limit, search, sort } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let sortQuery = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortQuery[field] = order === "desc" ? -1 : 1;
    }

    const projects = await Project.find(query).sort(sortQuery).skip(skip).limit(limit);
    const total = await Project.countDocuments(query);

    res.json({ total, page, limit, projects });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 📌 Create new project
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    console.log("✅ Project created:", project);
    res.status(201).json(project);
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(400).json({ message: "Error creating project" });
  }
};

// 📌 Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};

// 📌 Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
};

// 📌 Konfigurasi Upload Gambar
const storage = multer.memoryStorage(); // Menyimpan file di memory sebelum di-upload ke Cloudinary
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 5MB
});

exports.upload = upload;

// **📌 Upload gambar ke Cloudinary**
exports.uploadProjectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📢 Uploading file to Cloudinary...");

    // Upload file ke Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "portfolio_projects" }, // Folder di Cloudinary
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary Upload Error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed", error });
        }

        console.log("✅ File uploaded to Cloudinary:", result.secure_url);
        res.json({
          message: "File uploaded successfully",
          imageUrl: result.secure_url,
        });
      }
    ).end(req.file.buffer); // Gunakan buffer dari multer.memoryStorage()
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};