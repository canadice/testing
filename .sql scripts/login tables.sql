use portaldb;

CREATE TABLE refreshTokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    expires_at DATETIME NOT NULL,
    token VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_uid (uid)
);

select * from refreshTokens;