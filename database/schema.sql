-- 创建数据库
CREATE DATABASE IF NOT EXISTS meeting_booker 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE meeting_booker;

-- 创建会议室表
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    floor VARCHAR(20) NOT NULL COMMENT '楼层',
    room_number VARCHAR(50) NOT NULL UNIQUE COMMENT '会议室编号',
    capacity INT NOT NULL COMMENT '容纳人数',
    equipment VARCHAR(500) COMMENT '配套设备',
    description VARCHAR(500) COMMENT '描述',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_floor (floor),
    INDEX idx_room_number (room_number),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会议室表';

-- 创建预约表
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL COMMENT '会议室ID',
    applicant_name VARCHAR(100) NOT NULL COMMENT '申请人姓名',
    applicant_email VARCHAR(100) NOT NULL COMMENT '申请人邮箱',
    meeting_title VARCHAR(200) NOT NULL COMMENT '会议主题',
    description VARCHAR(1000) COMMENT '会议描述',
    participants INT NOT NULL COMMENT '参会人数',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT '状态',
    reject_reason VARCHAR(500) COMMENT '拒绝原因',
    approved_by VARCHAR(100) COMMENT '审批人',
    approved_at DATETIME COMMENT '审批时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    INDEX idx_applicant_name (applicant_name),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_time_range (start_time, end_time),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- 插入示例数据 - 会议室
INSERT INTO rooms (floor, room_number, capacity, equipment, description, is_active) VALUES
('1F', '101', 10, '投影仪、白板、音响系统', '小型会议室，适合团队讨论', TRUE),
('1F', '102', 20, '投影仪、白板、视频会议系统', '中型会议室，适合部门会议', TRUE),
('2F', '201', 50, '投影仪、白板、音响系统、视频会议', '大型会议室，适合全员大会', TRUE),
('2F', '202', 8, '白板、电视', '小型洽谈室，适合客户接待', TRUE),
('3F', '301', 100, '投影仪、大屏、专业音响、灯光', '多功能厅，适合大型活动', TRUE);

-- 插入示例数据 - 预约
INSERT INTO bookings (room_id, applicant_name, applicant_email, meeting_title, description, participants, start_time, end_time, status) VALUES
(1, '张三', 'zhangsan@example.com', '项目周会', '讨论本周项目进度和下周计划', 8, 
 DATE_ADD(CURDATE(), INTERVAL 10 HOUR), 
 DATE_ADD(CURDATE(), INTERVAL 11 HOUR), 
 'APPROVED'),
(2, '李四', 'lisi@example.com', '产品评审会', '新产品需求评审', 15, 
 DATE_ADD(CURDATE(), INTERVAL 14 HOUR), 
 DATE_ADD(CURDATE(), INTERVAL 16 HOUR), 
 'PENDING');
