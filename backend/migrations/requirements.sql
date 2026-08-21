<<<<<<< HEAD
-- CREATE requirements table
CREATE TABLE IF NOT EXISTS `requirements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `requirement_code` VARCHAR(50) UNIQUE NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `department_id` INT NOT NULL,
  `designation_id` INT NOT NULL,
  `employment_type` ENUM('Full Time', 'Part Time', 'Contract', 'Internship', 'Temporary', 'Freelancer', 'Remote', 'Hybrid') NOT NULL,
  `vacancies` INT NOT NULL,
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  `experience_from` INT NOT NULL,
  `experience_to` INT NOT NULL,
  `salary_from` DECIMAL(15,2) NULL,
  `salary_to` DECIMAL(15,2) NULL,
  `location` VARCHAR(255) NULL,
  `work_mode` VARCHAR(100) NULL,
  `education` VARCHAR(255) NULL,
  `skills` TEXT NULL,
  `job_description` TEXT NULL,
  `responsibilities` TEXT NULL,
  `requirements` TEXT NULL,
  `hiring_manager` INT NULL, -- Employee ID
  `requested_by` INT NULL, -- Employee ID
  `opening_date` DATE NOT NULL,
  `closing_date` DATE NOT NULL,
  `status` ENUM('Draft', 'Pending', 'Approved', 'Rejected', 'Open', 'On Hold', 'Closed', 'Cancelled', 'Filled') DEFAULT 'Draft',
  `approval_status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `remarks` TEXT NULL,
  `attachment` VARCHAR(500) NULL,
  `company_id` INT NULL,
  `branch_id` INT NULL,
  `created_by` INT NULL, -- User ID
  `updated_by` INT NULL, -- User ID
  `deleted_by` INT NULL, -- User ID
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

=======
>>>>>>> origin/main
-- CREATE requirement_audit_logs table to track changes
CREATE TABLE IF NOT EXISTS `requirement_audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `requirement_id` INT NOT NULL,
  `action` VARCHAR(50) NOT NULL, -- e.g., 'CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED', 'RESTORED'
  `status_from` VARCHAR(50) NULL,
  `status_to` VARCHAR(50) NULL,
  `performed_by` INT NOT NULL, -- User ID
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
