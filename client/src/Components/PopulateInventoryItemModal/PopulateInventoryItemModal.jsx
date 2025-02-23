import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import "./PopulateInventoryItemModal.css";

const PopulateInventoryItemModal = ({ open, handleClose, resources, onSubmit }) => {
  const [selectedItemId, setSelectedItemId] = useState("");

  const handleSubmit = () => {
    if (selectedItemId) {
      const selectedResource = resources.find(resource => resource.id === parseInt(selectedItemId));
      onSubmit(selectedResource); 
      handleClose();
    } else {
      alert("Please select a resource.");
    }
  };

  const handleChange = (e) => {
    setSelectedItemId(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "8px",
          position: "absolute",
          top: "10%",
        },
      }}
    >
      <div className="populate-modal-header">
        <DialogTitle className="populate-modal-title">Add Inventory to Location</DialogTitle>
      </div>

      <DialogContent dividers sx={{ borderColor: "#ccc" }}>
        <div className="populate-form-group">
          <select
            name="resourceSubType"
            className="populate-select"
            value={selectedItemId}
            onChange={handleChange}
          >
            <option value="">Select Resource</option>
            {resources.map((resource) => (
              <option
                key={resource.id}
                value={resource.id}
                className="populate-option"
              >
                {resource.name}
              </option>
            ))}
          </select>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} className="populate-btn-close">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="populate-btn-submit"
          disabled={!selectedItemId}
        >
          Add +
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopulateInventoryItemModal;
