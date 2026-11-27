CREATE TABLE people (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(254) COLLATE utf8mb4_0900_as_ci NOT NULL UNIQUE,
    phone VARCHAR(30)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE accounts (
    person_id BIGINT UNSIGNED PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (person_id) REFERENCES people(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE account_roles (
    person_id BIGINT UNSIGNED NOT NULL,
    role ENUM('student', 'manager', 'admin') NOT NULL,
    PRIMARY KEY (person_id, role),
    FOREIGN KEY (person_id) REFERENCES accounts(person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE login_attempts (
    attempt_key BINARY(32) PRIMARY KEY,
    failures INT UNSIGNED NOT NULL,
    window_start DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE resources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kind ENUM('room', 'equipment') NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    capacity INT UNSIGNED,
    quantity INT UNSIGNED,
    location VARCHAR(100),
    manager_id BIGINT UNSIGNED,
    opening_hours JSON,
    archived_at DATETIME,
    FOREIGN KEY (manager_id) REFERENCES people(id),
    CHECK (
        (kind = 'room' AND capacity IS NOT NULL AND capacity > 0 AND quantity IS NULL) OR
        (kind = 'equipment' AND quantity IS NOT NULL AND quantity > 0 AND capacity IS NULL)
    ),
    INDEX resources_catalog (kind, archived_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE resource_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT UNSIGNED NOT NULL,
    filename VARCHAR(100) NOT NULL UNIQUE,
    media_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT UNSIGNED NOT NULL,
    owner_id BIGINT UNSIGNED NOT NULL,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    purpose VARCHAR(1000) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (owner_id) REFERENCES accounts(person_id),
    CHECK (starts_at < ends_at AND quantity > 0),
    INDEX reservations_resource_interval (resource_id, status, starts_at, ends_at),
    INDEX reservations_owner (owner_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservation_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT UNSIGNED NOT NULL,
    actor_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL,
    reason VARCHAR(1000),
    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (actor_id) REFERENCES accounts(person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE access_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    purpose VARCHAR(1000) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES accounts(person_id),
    INDEX access_requests_owner (owner_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE access_request_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    access_request_id BIGINT UNSIGNED NOT NULL,
    actor_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL,
    reason VARCHAR(1000),
    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_request_id) REFERENCES access_requests(id),
    FOREIGN KEY (actor_id) REFERENCES accounts(person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE public_content (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kind ENUM('news', 'projects', 'events', 'partners', 'student-opportunities') NOT NULL,
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(250) NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSON,
    published_at DATETIME,
    UNIQUE (kind, slug),
    INDEX public_content_publication (kind, published_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    reservation_id BIGINT UNSIGNED,
    access_request_id BIGINT UNSIGNED,
    message VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (owner_id) REFERENCES accounts(person_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (access_request_id) REFERENCES access_requests(id),
    INDEX notifications_owner (owner_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
