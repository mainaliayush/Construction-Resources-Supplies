import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PopulateInventoryItemModal from "../PopulateInventoryItemModal/PopulateInventoryItemModal";
import AddResourceMiningPopup from "../AddResourceMiningPopup/AddResourceMiningPopup";

import bgImage from './bg-resource.jpeg'


import "./MiningInventoryManager.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const MiningInventoryManager = () => {

  const backendUrl = "https://resource-manager-e8d52038f36b.herokuapp.com";

  const [modalOpen, setModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const [editableIoH, setEditableIoH] = useState({});
  const [editableMinQty, setEditableMinQty] = useState({});
  const [editableTargetQty, setEditableTargetQty] = useState({});

  const [focusedTable, setFocusedTable] = useState(null);

  const locations = ["LOCATION TOTAL", "LOCATION A", "LOCATION B", "LOCATION C"];

  const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('selectedLocation') || ''); 
  const navigate = useNavigate();
  

  const [inventory, setInventory] = useState([]);


  const onCopyButtonClick = (title) => {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const newHash = `#${formattedTitle}`;
    const newUrl = `${window.location.href.split('#')[0]}${newHash}`;
  
    navigator.clipboard.writeText(newUrl).then(() => {
      alert("Link Generated! Please Ctrl+V on new tab!")
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });

    window.history.replaceState(null, null, newUrl);
  };
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); 
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
            setTimeout(() => {
              element.classList.add('focused');
              document.querySelector('.inventory-manager').classList.add('focused');
            }, 300);
          }
        }, 100);
      } else {
        document.querySelectorAll('.inventory-table').forEach(table => {
          table.classList.remove('focused');
        });
        document.querySelector('.inventory-manager').classList.remove('focused');
      }
    };
    
  
    handleHashChange();
  
    window.addEventListener('hashchange', handleHashChange);
  
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [inventory, resources]); 

  const handlePopulateItem = async (selectedResource) => {
    const resourceId = selectedResource.id;
    const formattedLocation = selectedLocation.replace(/\s+/g, '_').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  
    const ioh = 0;  
    const min_qty = 0;  
    const target_qty = 0;  
    const last_audit = new Date().toISOString();  
    const auditors = ['sam@resourcemanager.com', 'john@resourcemanager.com', 'lara@resourcemanager.com'];
    const audited_by = auditors[Math.floor(Math.random() * auditors.length)];
  
    const payload = { resourceId, location: formattedLocation, ioh, min_qty, target_qty, last_audit, audited_by };
  
    try {
      const response = await axios.post(`${backendUrl}/inventory`, payload);
      const inventoryData = response.data;

      console.log("Response from backend:", inventoryData);

      setInventory((prevInventory) => [...prevInventory, inventoryData]);
      setSelectedResource(selectedResource);

      fetchInventoryByLocation();

    } catch (error) {
      console.error("Error posting inventory:", error);
    }
  };

  const fetchInventoryByLocation = async () => {
    try {
        let response;

        if (selectedLocation === "LOCATION TOTAL") {
            response = await axios.get(`${backendUrl}/inventory`);
            console.log("Total: ", response)
        } else {
            const formattedLocation = selectedLocation.replace(/\s+/g, '_');
            response = await axios.get(`${backendUrl}/inventory/${formattedLocation}`);
        }

        // console.log("Response data: ", response.data);
        setInventory(response.data);

    } catch (error) {
        console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventoryByLocation();
  }, [selectedLocation]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${backendUrl}/resources`);
      // console.log("Form data: ", response.data)
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };
  
  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleResourceModalClose = () => {
    setResourceModalOpen(false);
    fetchResources(); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;

    try {
        await axios.delete(`${backendUrl}/inventory/${id}`);
        console.log(`Deleted item with ID: ${id}`);
        fetchInventoryByLocation();
    } catch (error) {
        console.error("Error deleting resource:", error);
    }
  };

  const handleEdit = (item) => {
    console.log("Editing item:", item);
    
    const resource = resources.find((res) => res.name === item.name);

    if (resource) {
        setEditingResource(resource); 
        setResourceModalOpen(true);
    } else {
        console.warn("No matching resource found for item:", item.name);
    }
  };

  const updateInventoryItem = async (id, field, value) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        await axios.put(`${backendUrl}/inventory/${id}`, {
            [field]: value,
            last_audit: today,
        });

        fetchInventoryByLocation();

    } catch (err) {
        console.error(`Error updating ${field} for item ${id}:`, err);
    }
  };

  const getStatus = (item) => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const lastAuditDate = new Date(item.last_audit);

    if (lastAuditDate < oneDayAgo) {
        return "STALE DATA";
    } else if (Number(item.ioh) < Number(item.min_qty)) {
        return "NEED TO REORDER";
    } else {
        return "AVAILABLE";
    }
  };

  const getAggregatedData = (data) => {
    const aggregatedData = {};
  
    data.forEach((item) => {
      const key = item.name;
  
      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          ...item,
          ioh: 0,
          min_qty: 0,
          target_qty: 0,
          rings: 0,
          min_rings: 0,
          target_rings: 0,
          last_audit: item.last_audit,
          audited_by: item.audited_by,
          status: item.status,
        };
      }
  
      aggregatedData[key].ioh += parseFloat(item.ioh) || 0;
      aggregatedData[key].min_qty += parseFloat(item.min_qty) || 0;
      aggregatedData[key].target_qty += parseFloat(item.target_qty) || 0;
      aggregatedData[key].rings += parseFloat(item.ioh) / parseFloat(item.qty_per_ring) || 0;
      aggregatedData[key].min_rings += parseFloat(item.min_qty) / parseFloat(item.qty_per_ring) || 0;
      aggregatedData[key].target_rings += parseFloat(item.target_qty) / parseFloat(item.qty_per_ring) || 0;
  
      if (new Date(item.last_audit) > new Date(aggregatedData[key].last_audit)) {
        aggregatedData[key].last_audit = item.last_audit;
        aggregatedData[key].audited_by = item.audited_by;
        aggregatedData[key].status = item.status;
      }
    });
  
    return Object.values(aggregatedData);
  };

  const renderTable = (title, data) => {
    if (data.length === 0) return null; 
    
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');

    const isLocationTotal = selectedLocation === "LOCATION TOTAL";
    const finalData = isLocationTotal ? getAggregatedData(data) : data;
    
    return (
      <div key={title} className="inventory-table" id={formattedTitle}>
        <div className="table-title">
          {title}{" "}
          <button className="copy-btn" onClick={() => onCopyButtonClick(title)}>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Measurement Unit</th>
              <th>Product Quantity</th>
              {/* <th>Order/Quantity </th> */}
              <th>Current Quantity </th>
              <th>Supply Ratio </th>
              <th>Minimum Quantity </th>
              <th>Quantity Needed </th>
              <th>Minimum Supplies </th>
              <th>Target Supplies </th>
              <th>Last Updated</th>
              <th>Updated By</th>
              <th>Resource Status </th>
              <th>Edit / Delete Resource</th>
            </tr>
          </thead>
          <tbody>
            {finalData.slice().sort((a, b) => a.id - b.id).map((item) => (
              <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.unit_of_measure}</td>
              <td>{item.qty_per_ring ? item.qty_per_ring.toFixed(2) : "0.00"}</td>
              {/* <td>{item.qty_per_ring ? (1 / item.qty_per_ring).toFixed(2) : "0.00"}</td> */}
            
              <td>
                {selectedLocation !== "LOCATION TOTAL" ? (
                  <input
                    type="number"
                    className="ioh-input"
                    value={editableIoH[item.id] ?? item.ioh ?? ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditableIoH((prev) => ({ ...prev, [item.id]: newValue }));
                      updateInventoryItem(item.id, "ioh", newValue);
                    }}
                    onBlur={(e) => {
                      const formattedValue = parseFloat(e.target.value).toFixed(2);
                      setEditableIoH((prev) => ({ ...prev, [item.id]: formattedValue }));
                    }}
                  />
                ) : (
                  parseFloat(item.ioh)?.toFixed(2) ?? "0.00"
                )}
              </td>
            
              <td>
                {Number.isNaN(parseFloat(editableIoH[item.id] ?? item.ioh) / parseFloat(item.qty_per_ring))
                  ? "0.00"
                  : (parseFloat(editableIoH[item.id] ?? item.ioh) / parseFloat(item.qty_per_ring)).toFixed(2)}
              </td>
            
              <td>
                {selectedLocation !== "LOCATION TOTAL" ? (
                  <input
                    type="number"
                    className="min-qty-input"
                    value={editableMinQty[item.id] ?? item.min_qty ?? ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditableMinQty((prev) => ({ ...prev, [item.id]: newValue }));
                      updateInventoryItem(item.id, "min_qty", newValue);
                    }}
                    onBlur={(e) => {
                      const formattedValue = parseFloat(e.target.value).toFixed(2);
                      setEditableMinQty((prev) => ({ ...prev, [item.id]: formattedValue }));
                    }}
                  />
                ) : (
                  parseFloat(item.min_qty)?.toFixed(2) ?? "0.00"
                )}
              </td>
            
              <td>
                {selectedLocation !== "LOCATION TOTAL" ? (
                  <input
                    type="number"
                    className="tgt-qty-input"
                    value={editableTargetQty[item.id] ?? item.target_qty ?? ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditableTargetQty((prev) => ({ ...prev, [item.id]: newValue }));
                      updateInventoryItem(item.id, "target_qty", newValue);
                    }}
                    onBlur={(e) => {
                      const formattedValue = parseFloat(e.target.value).toFixed(2);
                      setEditableTargetQty((prev) => ({ ...prev, [item.id]: formattedValue }));
                    }}
                  />
                ) : (
                  parseFloat(item.target_qty)?.toFixed(2) ?? "0.00"
                )}
              </td>
            
              <td>{(parseFloat(item.min_qty) / parseFloat(item.qty_per_ring) || 0).toFixed(2)}</td>
              <td>{(parseFloat(item.target_qty) / parseFloat(item.qty_per_ring) || 0).toFixed(2)}</td>

            
              <td>{item.last_audit?.split("T")[0] ?? "-"}</td>
              <td>{item.audited_by ?? "-"}</td>
            
              <td
                className={`status-cell status-${getStatus(item).toLowerCase().replace(/\s+/g, '-')}`}
              >
                {getStatus(item)}
              </td>
            
              <td>
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  {/* <FontAwesomeIcon icon={faPencil} /> */}
                  ✎
                </button>
                {selectedLocation !== "LOCATION TOTAL" && (
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                    {/* <FontAwesomeIcon icon={faTrash} /> */}
                    ❌ 
                  </button>
                )}
              </td>
            </tr>
            
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation);

    // Navigate to the new location route
    const formattedLocation = newLocation.toLowerCase().replace(/\s+/g, '-');
    navigate(`/inventory-manager/${formattedLocation}`);
  };
  

  return (
    <div className={`inventory-manager ${focusedTable ? 'focused' : ''}`} 
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="controls-container">
        <div className="button-container">
          {selectedLocation !== "LOCATION TOTAL" && (
            <>
              <button className="btn-populate" onClick={handleOpen}>
                Add Inventory +
              </button>
              {/* <button className="btn-add" disabled>
                Edit Calculation
              </button> */}
            </>
          )}
        </div>

        <div className="dropdown-container">
          <select value={selectedLocation} onChange={handleLocationChange}>
            {locations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>



      {renderTable("Electrical Resources", inventory.filter(item => item.resource_type === "Electrical Resources"))}
      {renderTable("Computer Resources", inventory.filter(item => item.resource_type === "Computer Resources"))}
      {renderTable("Machinery Resources", inventory.filter(item => item.resource_type === "Machinery Resources"))}
      {renderTable("Energy Resources", inventory.filter(item => item.resource_type === "Energy Resources"))}
      {renderTable("Construction Resources", inventory.filter(item => item.resource_type === "Construction Resources"))}

      <PopulateInventoryItemModal open={modalOpen} handleClose={handleClose} resources={resources} onSubmit={handlePopulateItem} />
      <AddResourceMiningPopup open={resourceModalOpen} handleClose={() => {handleResourceModalClose(); fetchInventoryByLocation(); }}  editingResource={editingResource} fetchResources={fetchResources}/>

    </div>
  );
};

export default MiningInventoryManager;