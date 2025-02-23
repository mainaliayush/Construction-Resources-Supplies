import pool from "../config/db.js";

export const addInventory = async (req, res) => {
  const { resourceId, location, ioh, min_qty, target_qty, last_audit, audited_by } = req.body;

  console.log("Req body: ", req.body)

  try {
    const queryText = `
      INSERT INTO inventory (resource_id, location, ioh, min_qty, target_qty, last_audit, audited_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [resourceId, location, ioh, min_qty, target_qty, last_audit, audited_by];

    const result = await pool.query(queryText, values);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding inventory:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllInventory = async (req, res) => {
    try {
        const query = `
            SELECT i.*, r.name, r.resource_type, r.unit_of_measure, r.qty_per_ring
            FROM inventory i
            JOIN resources r ON i.resource_id = r.id
        `;

        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getInventoryByLocation = async (req, res) => {
    let { selectedLocation } = req.params;

    selectedLocation = selectedLocation.replace(/\s+/g, '_').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  
    try {
      const queryText = `
        SELECT i.*, r.name, r.unit_of_measure, r.qty_per_ring, r.resource_type
        FROM inventory i
        JOIN resources r ON i.resource_id = r.id
        WHERE i.location = $1;
      `;
      const values = [selectedLocation];
      const results = await pool.query(queryText, values);


      return res.status(200).json(results.rows);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

export const getInventoryById = async (req, res) => {

};

export const deleteInventoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.status(200).json({ message: "Inventory item deleted successfully", deletedItem: result.rows[0] });
    } catch (err) {
        console.error("Error deleting inventory item:", err);
        res.status(500).json({ message: "Server error while deleting inventory item" });
    }
};

export const updateInventoryById = async (req, res) => {
    const { id } = req.params;
    const { last_audit, ...updateFields } = req.body;

    const field = Object.keys(updateFields)[0];
    const value = parseFloat(Object.values(updateFields)[0]);

    if (!['ioh', 'min_qty', 'target_qty'].includes(field)) {
        return res.status(400).json({ message: 'Invalid field to update' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT * FROM inventory WHERE id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const item = rows[0];

        const qtyPerRing = parseFloat(item.qty_per_ring) || 1; // qty_per_ring from resource table 
        const ringsPerQty = item.rings_per_qty ? parseFloat(1 / item.rings_per_qty) : 1; // Calculate in client

        const updatedItem = {
            ...item,
            [field]: value,
            last_audit,
            rings: parseFloat((value * ringsPerQty).toFixed(2)),  // Calculate in client
            min_rings: (item.min_qty / qtyPerRing), // Calculate in client 
            target_rings: (item.target_qty / qtyPerRing), //Calculate in client
        };

        // Status - Calculate in client
        if (updatedItem.ioh < updatedItem.min_qty) {
            updatedItem.status = "Reorder";
        } else if (new Date().getTime() - new Date(updatedItem.last_audit).getTime() > 86400000) {
            updatedItem.status = "Out of Date";
        } else {
            updatedItem.status = "Good";
        }

        const result = await pool.query(
            `UPDATE inventory 
             SET ${field} = $1, last_audit = $2, rings = $3, 
                 min_rings = $4, target_rings = $5, status = $6
             WHERE id = $7 
             RETURNING *`,
            [
                value, 
                last_audit, 
                updatedItem.rings, 
                updatedItem.min_rings, 
                updatedItem.target_rings, 
                updatedItem.status, 
                id
            ]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// export const getInventoryByLocationAndId = async (req, res) => {
//     let { location, resourceId } = req.params;

//     location = location.replace(/_/g, ' ');

//     // console.log("location", location)
//     // console.log("resourceId", resourceId)

//     try {
//         const query = `
//             SELECT i.*, r.name, r.resource_type, r.unit_of_measure, r.qty_per_ring
//             FROM resources r
//             JOIN inventory i ON i.resource_id = r.id
//             WHERE i.location = $1 AND i.resource_id = $2
//         `;
        
//         const { rows } = await pool.query(query, [location, resourceId]);

//         // console.log("Rows dey: ", rows.length)

//         if (rows.length === 0) {
//             return res.status(200).json([]);  
//         }

//         res.status(200).json(rows);
//     } catch (error) {
//         console.error('Error fetching inventory with resource details:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


