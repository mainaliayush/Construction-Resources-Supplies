import React, { useState, useEffect} from "react";
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import "./AddResourceMiningPopup.css";

const AddResourceMiningPopup = ({ open, handleClose, editingResource, fetchResources }) => {
  const backendUrl = "https://your-backend-app.herokuapp.com";

  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    resourceType: "",
    resourceSubType: "",
    tbms: "",
    subsystem: "",
    unitOfMeasure: "",
    qtyPerRing: "",
    isQuantized: "",
    manualOrderQty: "",
    parentAssembly: "",
    qtyPerAssembly: "",
    vendor: "",
    vendorProductNumber: "",
    unitCost: "",
    leadTime: "",
    description: "",
    images: null,
  });

  useEffect(() => {
    if (editingResource) {
      setFormData({
        name: editingResource.name || "",
        partNumber: editingResource.tbc_part_number || "",
        resourceType: editingResource.resource_type || "",
        resourceSubType: editingResource.resource_sub_type || "",
        tbms: editingResource.tbms || "",
        subsystem: editingResource.subsystem || "",
        unitOfMeasure: editingResource.unit_of_measure || "",
        qtyPerRing: editingResource.qty_per_ring || "",
        isQuantized: editingResource.is_quantized?.toString() || "False",
        manualOrderQty: editingResource.manual_order_qty?.toString() || "False",
        parentAssembly: editingResource.parent_assembly || "",
        qtyPerAssembly: editingResource.qty_per_assembly || "",
        vendor: editingResource.vendor || "",
        vendorProductNumber: editingResource.vendor_product_no || "",
        unitCost: editingResource.unit_cost || "",
        leadTime: editingResource.lead_time_weeks || "",
        description: editingResource.description || "",
        images: editingResource.images || null,
      });
    } else {
      setFormData({
        name: "",
        partNumber: "",
        resourceType: "",
        resourceSubType: "",
        tbms: "",
        subsystem: "",
        unitOfMeasure: "",
        qtyPerRing: "",
        isQuantized: "",
        manualOrderQty: "",
        parentAssembly: "",
        qtyPerAssembly: "",
        vendor: "",
        vendorProductNumber: "",
        unitCost: "",
        leadTime: "",
        description: "",
        images: null,
      });
    }
  }, [editingResource]);

  // console.log("Formdata: ", formData)

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log(`Input Changed: ${name} = ${value}`); // Debugging line

    setFormData((prevData) => ({
        ...prevData,
        [name]: type === "file" ? files : value,
    }));
};


  // const handleFileChange = (e) => {
  //   const files = e.target.files;
  //   if (files && files.length > 0) {
  //       setFormData((prevData) => ({
  //           ...prevData,
  //           images: files, 
  //       }));
  //   }
  // };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    // console.log("formDataToSend: ", formDataToSend)

    Object.keys(formData).forEach((key) => {
      if (key === "images" && formData.images) {
          for (let i = 0; i < formData.images.length; i++) {
              formDataToSend.append("images", formData.images[i]);
          }
      } else {
          formDataToSend.append(key, formData[key]);
      }
    });
  
  
    console.log("Submitting formData:", Object.fromEntries(formDataToSend));

    try {
      if (editingResource) {
        console.log("editingResource: ", editingResource)
        // console.log("formDataToSend: ", formDataToSend)

        await axios.put(
          `${backendUrl}/resources/${editingResource.id}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

      } else {
        await axios.post(
          `${backendUrl}/resources/`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

      }

      handleClose();
      setFormData({
        name: "",
        partNumber: "",
        resourceType: "",
        resourceSubType: "",
        tbms: "",
        subsystem: "",
        unitOfMeasure: "",
        qtyPerRing: "",
        isQuantized: "",
        manualOrderQty: "",
        parentAssembly: "",
        qtyPerAssembly: "",
        vendor: "",
        vendorProductNumber: "",
        unitCost: "",
        leadTime: "",
        description: "",
        images: null,
      });
    
      fetchResources(); 

    } catch (error) {
      console.error("Error submitting resource:", error);
      alert(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  // console.log("Form Data: ", formData)
  

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="" fullWidth sx={{ "& .MuiPaper-root": { borderRadius: "8px" } }}>
      <div className="modal-header">
        <DialogTitle className="modal-title"><b>ADD RESOURCE</b></DialogTitle>
        <button className="close-btn" onClick={handleClose}>&times;</button>
      </div>

      <DialogContent dividers sx={{ borderColor: "#ccc" }}>

        {/* ITEM INFO SECTION */}
        <div className="section">
          <div className="section-title">Item Detail</div>
          <div className="form-row">
            <div className="form-group">
              <label>Resource Name <span>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Resource Manufacture No.</label>
              <input type="text" name="partNumber" value={formData.partNumber} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Resource Type <span>*</span></label>
              <select name="resourceType" value={formData.resourceType || "Select Resource Type"} onChange={handleChange} required>
                <option disabled value="Select Resource Type">Select Resource Type</option>
                <option value="Electrical Resources">Electrical Resources</option>
                <option value="Machinery Resources">Machinery Resources</option>
                <option value="Computer Resources">Computer Resources</option>
                <option value="Construction Resources">Construction Resources</option>
                <option value="Energy Resources">Energy Resources</option>
              </select>

            </div>
            <div className="form-group">
              <label>Resource Category</label>
              <select name="resourceSubType" value={formData.resourceSubType} onChange={handleChange}>
                <option value="">Select Category</option>
                <option value="Category A">Category A</option>
                <option value="Category B">Category B</option>
                <option value="Category C">Category C</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>WareHouse</label>
              <select name="tbms" value={formData.tbms} onChange={handleChange}>
                <option value="">Select WareHouse</option>
                <option value="Warehouse 1">Warehouse 1</option>
                <option value="Warehouse 2">WareHouse 2</option>
                <option value="Warehouse 3">WareHouse 3</option>

              </select>
            </div>
            <div className="form-group">
              <label>Material Type</label>
              <select name="subsystem" value={formData.subsystem} onChange={handleChange}>
                <option value="">Select Material</option>
                <option value="Metals">Metal Items</option>
                <option value="Plastic">Plastic Items</option>
                <option value="Cement">Cement Items</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{gap:"0px"}}>
            <div className="form-row" >
              <div className="form-group">
                <label>Measurement Unit <span>*</span></label>
                <select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange}>
                  <option value="Select">Select</option>
                  <option value="counts">counts</option>
                  <option value="bags">bags</option>
                  <option value="sets">sets</option>
                  <option value="pairs">pairs</option>
                  <option value="particles">particles</option>
                </select>
              </div>
              <div className="form-group">
                <label>Order Quantity</label>
                <input name="qtyPerRing" placeholder ="0" value={formData.qtyPerRing} onChange={handleChange} style={{maxWidth:"80%"}}/>
              </div>
            </div>
            <div className="form-row" style={{marginLeft:"0px", gap:"70px"}}>
              <div className="form-group" >
                <label>Order for Later</label>
                <select name="isQuantized" value={formData.isQuantized?.toString()} onChange={handleChange} style={{width:"150%"}} >
                  {/* <option value="">Select</option> */}
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
              <div className="form-group">
                <label>OrderItemsManually</label>
                <select name="manualOrderQty" value={formData.manualOrderQty?.toString()} onChange={handleChange} style={{width:"125%"}}>
                  {/* <option value="">Select</option> */}
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            </div>
            
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Warranty Period</label>
              <select name="parentAssembly" value={formData.parentAssembly} onChange={handleChange}>
                <option value="">Select</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
                <option value="18 months">18 months</option>
              </select>
            </div>
            <div className="form-group">
              <label>Qty per Assembly</label>
              <input type="number" name="qtyPerAssembly" placeholder="0" value={formData.qtyPerAssembly} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* VENDOR AND OTHER INFO SECTION */}
        <div className="section">
          <div className="section-title">Supplier Detail</div>
          <div className="form-row">
            <div className="form-group">
              <label>Supplier</label>
              <select name="vendor" value={formData.vendor} onChange={handleChange}>
                <option value="">Select Supplier</option>
                <option value="Supplier 1">Supplier 1</option>
                <option value="Supplier 2">Supplier 2</option>
                <option value="Supplier 3">Supplier 3</option>
                <option value="Supplier 4">Supplier 4</option>

              </select>
            </div>
            <div className="form-group">
              <label>Supplier Number</label>
              <input type="text" name="vendorProductNumber" value={formData.vendorProductNumber} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cost Per Item</label>
              <input type="number" name="unitCost"  placeholder="0" value={formData.unitCost} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Average Arrival Weeks</label>
              <input type="number" name="leadTime" placeholder="0" value={formData.leadTime} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes/Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} required />
          </div>
        </div>

        <div className="section">
          <div className="section-title"> Image</div>

          {formData.images && (
            <div className="image-name">
              {typeof formData.images === "string" ? formData.images : formData.images.name}
            </div>
          )}
          
          <input 
            type="file" 
            name="images" 
            onChange={handleChange}
          />
        
        </div>

      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} className="btn-close">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="btn-submit">
          Submit 
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResourceMiningPopup;
