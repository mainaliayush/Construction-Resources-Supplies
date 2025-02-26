import pool from "../config/db.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });


export const addResource = async (req, res) => {
    try {

        console.log("Received Data:", req.body); 
        console.log("Received File:", req.file); 

        const { name, partNumber, resourceType, resourceSubType, tbms, subsystem, unitOfMeasure, qtyPerRing, isQuantized, manualOrderQty, parentAssembly, qtyPerAssembly, vendor, vendorProductNumber, unitCost, leadTime, description } = req.body;
        const imagePath = req.file ? req.file.path : null;
    
        const isQuantizedBool = req.body.isQuantized === "true";
        const manualOrderQtyBool = req.body.manualOrderQty === "true";

    
        const query = `INSERT INTO resources (name, tbc_part_number, resource_type, resource_sub_type, tbms, subsystem, unit_of_measure, qty_per_ring, is_quantized, manual_order_qty, parent_assembly, qty_per_assembly, vendor, vendor_product_no, unit_cost, lead_time_weeks, description, images) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
                       RETURNING *;`;
    
        const values = [name, partNumber, resourceType, resourceSubType, tbms, subsystem, unitOfMeasure, qtyPerRing, isQuantizedBool, manualOrderQtyBool, parentAssembly, qtyPerAssembly, vendor, vendorProductNumber, unitCost, leadTime, description, imagePath];

        try {
            const result = await pool.query(query, values);
            console.log("Added to resources table successfully!");
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Query execution error:", error);
            throw new Error('Database insertion failed');
        }

    } catch (error) {
        console.error("Error adding resource:", error);
        res.status(500).json({ error: "Failed to add resource" });
    }
};

export const getAllResources = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM resources");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const getResourceById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = "SELECT * FROM resources WHERE id = $1";
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteResourceById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM resources WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted successfully", deletedResource: result.rows[0] });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateResourceById = async (req, res) => {
  console.log("Received PUT request body:", req.body);
  console.log("Received file:", req.file);

  const { id } = req.params;
  const { name, partNumber, resourceType, resourceSubType, tbms, subsystem, unitOfMeasure, qtyPerRing, isQuantized, manualOrderQty, parentAssembly, qtyPerAssembly, vendor, vendorProductNumber, unitCost, leadTime, description } = req.body;

  try {
    let imagePath = req.file ? req.file.path : null;

    // Fetch existing resource to retain old image if no new one is provided
    const existingResource = await pool.query("SELECT images FROM resources WHERE id = $1", [id]);
    if (existingResource.rows.length === 0) return res.status(404).json({ message: "Resource not found" });

    imagePath = imagePath || existingResource.rows[0].images;

    // Create the updated resource object
    const updatedResource = {
      name,
      partNumber,
      resource_type: resourceType, 
      resource_sub_type: resourceSubType,
      tbms,
      subsystem,
      unit_of_measure: unitOfMeasure,
      qty_per_ring: Number(qtyPerRing),
      is_quantized: isQuantized === "true",
      manual_order_qty: manualOrderQty === "true",
      parent_assembly: parentAssembly,
      qty_per_assembly: Number(qtyPerAssembly),
      vendor,
      vendor_product_number: vendorProductNumber,
      unit_cost: parseFloat(unitCost),
      lead_time: Number(leadTime),
      description,
      images: imagePath,
    };

    const result = await pool.query(
      `UPDATE resources SET name=$1, tbc_part_number=$2, resource_type=$3, resource_sub_type=$4, tbms=$5, subsystem=$6, unit_of_measure=$7, qty_per_ring=$8, is_quantized=$9, manual_order_qty=$10, parent_assembly=$11, qty_per_assembly=$12, vendor=$13, vendor_product_no=$14, unit_cost=$15, lead_time_weeks=$16, description=$17, images=$18 WHERE id=$19`,
      Object.values(updatedResource).concat(id)
    );

    if (!result.rowCount) return res.status(404).json({ message: "Resource not found or not updated" });

    res.json({ message: "Resource updated successfully", updatedResource });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

