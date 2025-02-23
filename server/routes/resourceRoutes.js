import express from "express";
import { getAllResources, addResource, getResourceById, updateResourceById, deleteResourceById, upload } from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getAllResources);
router.post("/", upload.single("images"), addResource);
router.get("/:id", getResourceById);
router.put("/:id", upload.single("images"), updateResourceById);
router.delete("/:id", deleteResourceById);

router.get("/image/:filename", (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, "..", "uploads", filename);  
  
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.sendFile(imagePath); 
    });
  });

export default router;
