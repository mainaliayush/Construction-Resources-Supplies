CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tbc_part_number VARCHAR(255),
    resource_type VARCHAR(255) NOT NULL,
    resource_sub_type VARCHAR(255),
    tbms VARCHAR(255),
    subsystem VARCHAR(255),
    unit_of_measure VARCHAR(50) NOT NULL,
    qty_per_ring INT DEFAULT 0,
    is_quantized BOOLEAN DEFAULT FALSE,
    manual_order_qty BOOLEAN DEFAULT FALSE,
    parent_assembly VARCHAR(255),
    qty_per_assembly INT DEFAULT 0,
    vendor VARCHAR(255),
    vendor_product_no VARCHAR(255),
    unit_cost DECIMAL(10,2) DEFAULT 0,
    lead_time_weeks INT DEFAULT 0,
    description TEXT,
    images TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL,
    location VARCHAR(50) NOT NULL CHECK (location IN ('Total', 'Location A', 'Location B', 'Location C', 'Location D')),

    ioh DECIMAL(10,2) DEFAULT 0,
    rings INT DEFAULT 0,        
    min_qty DECIMAL(10,2) DEFAULT 0,
    target_qty DECIMAL(10,2) DEFAULT 0,
    min_rings INT DEFAULT 0,
    target_rings INT DEFAULT 0,

    last_audit DATE DEFAULT CURRENT_DATE,
    audited_by VARCHAR(255),
    status VARCHAR(50) CHECK (status IN ('Good', 'Reorder', 'Out of Date')) DEFAULT 'Good',

    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- INSERT INTO inventory (resource_id, location, ioh, rings, min_qty, target_qty, min_rings, target_rings, last_audit, audited_by, status)
-- VALUES 
--     (1, 'Location A', 100.50, 5, 20, 50, 2, 5, '2025-02-19', 'John Doe', 'Good'),
--     (2, 'Location A', 80.75, 4, 15, 40, 1, 4, '2025-02-18', 'Jane Smith', 'Reorder'),
--     (5, 'Location A', 95.00, 6, 25, 60, 2, 6, '2025-02-17', 'Alice Johnson', 'Good'),
--     (6, 'Location A', 120.30, 7, 30, 70, 3, 7, '2025-02-16', 'Jane Smith', 'Out of Date'),
--     (7, 'Location A', 110.10, 5, 20, 55, 2, 5, '2025-02-15', 'Jane Smiths', 'Good'),
--     (8, 'Location A', 90.40, 3, 18, 45, 1, 4, '2025-02-14', 'Eve Wilson', 'Reorder'),
--     (9, 'Location A', 70.60, 2, 12, 30, 1, 3, '2025-02-13', 'Jane Smiths', 'Good'),
--     (12, 'Location A', 85.20, 4, 22, 55, 2, 5, '2025-02-12', 'Jane Smith', 'Good'),
--     (13, 'Location A', 102.75, 6, 28, 65, 2, 6, '2025-02-11', 'Henry White', 'Out of Date'),
--     (14, 'Location A', 115.90, 7, 35, 75, 3, 7, '2025-02-10', 'Ivy Green', 'Good'),
--     (16, 'Location A', 130.20, 8, 40, 80, 4, 8, '2025-02-09', 'Alice Johnson', 'Reorder'),

--     (1, 'Location B', 90.00, 4, 18, 48, 2, 4, '2025-02-08', 'Jack Black', 'Good'),
--     (2, 'Location B', 75.50, 3, 14, 38, 1, 4, '2025-02-07', 'Jack Blackh', 'Reorder'),
--     (5, 'Location B', 85.00, 5, 22, 55, 2, 5, '2025-02-06', 'Alice Johnson', 'Good'),
--     (6, 'Location B', 110.00, 6, 28, 68, 3, 6, '2025-02-05', 'Bob Brown', 'Out of Date'),
--     (7, 'Location B', 100.20, 4, 19, 50, 2, 5, '2025-02-04', 'Ivy Green', 'Good'),
--     (8, 'Location B', 80.40, 2, 16, 42, 1, 4, '2025-02-03', 'Ivy Green', 'Reorder'),
--     (9, 'Location B', 65.80, 3, 10, 28, 1, 3, '2025-02-02', 'Frank Thomas', 'Good'),
--     (12, 'Location B', 78.90, 4, 21, 52, 2, 5, '2025-02-01', 'Grace Lee', 'Good'),
--     (13, 'Location B', 95.50, 5, 27, 60, 2, 6, '2025-01-31', 'Henry White', 'Out of Date'),
--     (14, 'Location B', 108.20, 6, 32, 72, 3, 7, '2025-01-30', 'Ivy Green', 'Good'),
--     (16, 'Location B', 120.00, 7, 38, 78, 4, 8, '2025-01-29', 'Jane Smiths', 'Reorder'),

--     (1, 'Location C', 95.30, 5, 22, 52, 2, 5, '2025-01-28', 'John Doe', 'Good'),
--     (2, 'Location C', 78.60, 3, 15, 37, 1, 4, '2025-01-27', 'Jane Smith', 'Reorder'),
--     (5, 'Location C', 88.40, 5, 24, 58, 2, 5, '2025-01-26', 'John Doe', 'Good'),
--     (6, 'Location C', 112.30, 6, 30, 70, 3, 6, '2025-01-25', 'John Doe', 'Out of Date'),
--     (7, 'Location C', 105.00, 5, 22, 53, 2, 5, '2025-01-24', 'Charlie Davis', 'Good'),
--     (8, 'Location C', 83.40, 3, 17, 44, 1, 4, '2025-01-23', 'Jane Smiths', 'Reorder'),
--     (9, 'Location C', 68.90, 2, 11, 30, 1, 3, '2025-01-22', 'Frank Thomas', 'Good'),
--     (12, 'Location C', 82.70, 4, 23, 56, 2, 5, '2025-01-21', 'John Doe', 'Good'),
--     (13, 'Location C', 97.30, 5, 29, 63, 2, 6, '2025-01-20', 'Henry White', 'Out of Date'),
--     (14, 'Location C', 110.10, 6, 34, 74, 3, 7, '2025-01-19', 'Jane Smiths', 'Good'),
--     (16, 'Location C', 125.40, 7, 39, 80, 4, 8, '2025-01-18', 'Jack Black', 'Reorder');


-- ALTER TABLE inventory
--     ALTER COLUMN rings TYPE DECIMAL(10,2) USING rings::DECIMAL,
--     ALTER COLUMN min_rings TYPE DECIMAL(10,2) USING min_rings::DECIMAL,
--     ALTER COLUMN target_rings TYPE DECIMAL(10,2) USING target_rings::DECIMAL;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('applicant', 'employer')) NOT NULL
);

