import express from "express";
import { getAllResources, addResource, getResourceById, updateResourceById, deleteResourceById, upload } from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getAllResources);
router.post("/", upload.single("images"), addResource);
router.get("/:id", getResourceById);
router.put("/:id", upload.single("images"), updateResourceById);
router.delete("/:id", deleteResourceById);

export default router;
