import express from "express";
// import { getAllInventory, addInventory, getInventoryById, updateInventoryById, deleteInventoryById, getInventoryByLocationAndId } from "../controllers/inventoryController.js";
import { getAllInventory, addInventory, getInventoryById, updateInventoryById, deleteInventoryById, getInventoryByLocation } from "../controllers/inventoryController.js";


const router = express.Router();

router.get("/", getAllInventory);
router.get("/:selectedLocation", getInventoryByLocation);


router.post("/", addInventory); // backend will hit this endpoint


// router.get('/:location/:resourceId', getInventoryByLocationAndId); // we don't need this

router.put("/:id", updateInventoryById);
router.delete("/:id", deleteInventoryById);


export default router;
