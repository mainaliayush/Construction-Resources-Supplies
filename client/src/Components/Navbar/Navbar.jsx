import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import './navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isResourceManager = location.pathname.startsWith('/resource-manager');
  const isInventoryManager = location.pathname.startsWith('/inventory-manager');

  const navigateTo = isResourceManager ? '/inventory-manager' : '/resource-manager';
  const linkText = isResourceManager ? 'To Inventory  ' : 'To Resources  ';
  // const pageTitle = isInventoryManager ? 'INVENTORY MANAGER' : 'RESOURCE MANAGER';

  return (
    <nav className="navbar">
      <div className="navbar-logo">🛠️🛠️ Inventory Locations 🔩🔩</div>
      <Link to={navigateTo} className="navbar-link">
        {linkText}
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
      </Link>
    </nav>
  );
};

export default Navbar;