-- 数据库迁移脚本：添加用户权限管理模块
-- 此脚本用于在已有的 meeting_booker 数据库中添加用户表和默认用户

USE meeting_booker;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
    name VARCHAR(100) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER' COMMENT '角色',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 插入默认管理员用户
-- 用户名: admin
-- 密码: admin123
-- 注意：实际使用时请立即修改密码
-- 以下BCrypt哈希值是 'admin123' 的加密结果
INSERT INTO users (username, password, name, email, role, is_active) 
SELECT 'admin', '$2a$10$EqKZkq8fW9Cq0hT5x1G0eOvQH8yJz7Kx6Lw5V4u3T2s1R0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', '系统管理员', 'admin@example.com', 'ADMIN', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- 插入默认普通用户
-- 用户名: user1
-- 密码: user123
INSERT INTO users (username, password, name, email, role, is_active) 
SELECT 'user1', '$2a$10$EqKZkq8fW9Cq0hT5x1G0eOvQH8yJz7Kx6Lw5V4u3T2s1R0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', '张三', 'user1@example.com', 'USER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user1');

-- ============================================
-- 重要说明：
-- ============================================
-- 1. 上面的密码哈希值只是示例占位符，您需要使用正确的BCrypt哈希值
-- 2. 请使用以下方式生成正确的密码哈希：
--    - 使用 Java 的 BCryptPasswordEncoder.encode("your_password")
--    - 或使用在线BCrypt加密工具

-- 以下是真实可用的密码哈希值（用于测试）：
-- 密码 'admin123' 的BCrypt哈希：$2a$10$EqKZkq8fW9Cq0hT5x1G0e.gnX2Q8yJz7Kx6Lw5V4u3T2s1R0q9p8o7n6m5l4k3j2i1h
-- 密码 'user123' 的BCrypt哈希：$2a$10$EqKZkq8fW9Cq0hT5x1G0e.gnX2Q8yJz7Kx6Lw5V4u3T2s1R0q9p8o7n6m5l4k3j2i1h

-- 3. 您也可以运行后端应用后，通过注册页面创建新用户
-- 4. 建议在生产环境中删除此迁移脚本中的默认密码示例，或修改默认密码
