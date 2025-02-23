import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan, faCopy, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import AddResourceMiningPopup from "../AddResourceMiningPopup/AddResourceMiningPopup";
import bgImage from './bg-resource.jpeg'
import "./MiningResourceManager.css";


const MiningResourceManager = () => {

  const backendUrl = "https://resource-manager-e8d52038f36b.herokuapp.com";

  const [modalOpen, setModalOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [focusedTable, setFocusedTable] = useState(null);

  const onCopyButtonClick = (title) => {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const newHash = `#${formattedTitle}`;
    const newUrl = `${window.location.href.split('#')[0]}${newHash}`;
  
    navigator.clipboard.writeText(newUrl).then(() => {
      alert("Copied to Clipboard! Please use new tab to see results!")
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });

    window.history.replaceState(null, null, newHash);
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
              document.querySelector('.resource-manager').classList.add('focused');
            }, 300); 
          }
        }, 100);
      } else {
        document.querySelectorAll('.resource-table').forEach(table => {
          table.classList.remove('focused');
        });
        document.querySelector('.resource-manager').classList.remove('focused');
      }
    };
  
    handleHashChange();
  
    window.addEventListener('hashchange', handleHashChange);
  
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [inventory, resources]); 

  const handleOpen = () => {
    setEditingResource(null); 
    setModalOpen(true);
  };
  
  const handleClose = (resetFormData) => {
    setModalOpen(false);
    // setEditingResource(null);
    // if (resetFormData) resetFormData(); 
  };

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${backendUrl}/resources`);
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };
  
  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
  
    try {
      await axios.delete(`${backendUrl}/resources/${id}`);
      setResources(resources.filter((resource) => resource.id !== id)); 
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource); 
    // console.log("What data in input during edit: ", resource)
    setModalOpen(true);
  };
  

  const electricalResources = resources.filter(
    (item) => item.resource_type === "Electrical Resources"
  );
  const computerResources = resources.filter(
    (item) => item.resource_type === "Computer Resources"
  );
  const machineryResources = resources.filter(
    (item) => item.resource_type === "Machinery Resources"
  );
  const energyResources = resources.filter(
    (item) => item.resource_type === "Energy Resources"
  );
  const constructionResources = resources.filter(
    (item) => item.resource_type === "Construction Resources"
  );


  const renderTable = (title, data) => {
    if (data.length === 0) return null;
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');

    return (
      <div key={title} className="resource-table" id={formattedTitle}>
        <div className="table-title">
          {title.toUpperCase()}{" "}
          <button className="copy-btn"  onClick={() => onCopyButtonClick(title)}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Measurement Unit</th>
              <th>Resource Type</th>
              <th>WareHouse</th>
              <th>Order Quantity</th>
              <th>Supplier</th>
              <th>Supplier Number</th>
              <th>Arrival Time</th>
              <th>Cost Per Item</th>
              <th>Edit/Delete</th>
            </tr>
          </thead>
          <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.unit_of_measure}</td>
              <td>{item.resource_type}</td>
              <td>{item.tbms}</td>
              <td>{item.qty_per_ring}</td>
              <td>{item.vendor}</td>
              <td>{item.vendor_product_no}</td>
              <td>{item.lead_time_weeks}</td>
              <td>{item.unit_cost}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  {/* <FontAwesomeIcon icon={faEdit} /> */}
                  ✎
                </button>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                  {/* <FontAwesomeIcon icon={faTrashCan} /> */}
                  ❌ 
                </button>
              </td>
            </tr>
          ))}

          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`resource-manager ${focusedTable ? 'focused' : ''}`}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      >
      {/* <h1> Resources Management Dashboard</h1> */}
      <button className="add-btn" onClick={handleOpen}>
        Add Resource +
      </button>
      <AddResourceMiningPopup open={modalOpen} handleClose={handleClose} editingResource={editingResource} fetchResources={fetchResources}/>

      {renderTable("Electrical Resources", electricalResources)}
      {renderTable("Computer Resources", computerResources)}
      {renderTable("Machinery Resources", machineryResources)}
      {renderTable("Energy Resources", energyResources)}
      {renderTable("Construction Resources", constructionResources)}
    </div>
  );
};

export default MiningResourceManager;
