

/*
지역 좌표 테이블
*/

CREATE TABLE `AreaData` (
	`area_no` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`area` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`X` BIGINT(20) NULL DEFAULT NULL,
	`Y` BIGINT(20) NULL DEFAULT NULL,
	`areacode` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	PRIMARY KEY (`area_no`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=15
;


/*
그룹 테이블
*/

CREATE TABLE `group` (
	`group_no` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '그룹 번호',
	`school_no` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '학교 번호',
	`name` VARCHAR(20) NOT NULL COMMENT '그룹 이름' COLLATE 'utf8mb4_general_ci',
	`parent_group_no` BIGINT(20) NULL DEFAULT NULL COMMENT '부모 그룹 번호',
	`created` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
	`updated` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
	`deleted` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
	PRIMARY KEY (`group_no`) USING BTREE
)
COMMENT='그룹'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=301
;


/*
그룹 권한 테이블
*/

CREATE TABLE `groupPermission` (
	`group_no` BIGINT(20) UNSIGNED NOT NULL COMMENT '그룹 번호',
	`permission_no` BIGINT(20) UNSIGNED NOT NULL COMMENT '권한 번호',
	`is_allowed` CHAR(1) NULL DEFAULT NULL COMMENT '허용 여부 (Y/N)' COLLATE 'utf8mb4_general_ci',
	`override` CHAR(1) NULL DEFAULT NULL COMMENT '허용 여부 (Y/N)' COLLATE 'utf8mb4_general_ci',
	`extra_condition` LONGTEXT NULL DEFAULT NULL COMMENT '추가 조건' COLLATE 'utf8mb4_general_ci',
	`extra_limit` VARCHAR(50) NULL DEFAULT NULL COMMENT '추가 조건 제약' COLLATE 'utf8mb4_general_ci',
	`created` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
	`updated` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
	`deleted` DATETIME NULL DEFAULT NULL COMMENT '삭제일시'
)
COMMENT='그룹 권한'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;


/*
이력 테이블
*/

CREATE TABLE `history` (
	`log_no` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '로그 PK',
	`manager_no` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '회원 PK',
	`school_no` BIGINT(20) UNSIGNED NULL DEFAULT '0' COMMENT '학교 PK',
	`ip` VARCHAR(45) NULL DEFAULT NULL COMMENT '행위 발생 IP (IPv4/IPv6)' COLLATE 'utf8mb4_general_ci',
	`user_agent` TEXT NULL DEFAULT NULL COMMENT 'User-Agent' COLLATE 'utf8mb4_general_ci',
	`action_type` VARCHAR(1) NOT NULL COMMENT '조회(S), 추가(I), 수정(U), 삭제(D)' COLLATE 'utf8mb4_general_ci',
	`target_table` VARCHAR(50) NULL DEFAULT NULL COMMENT '어떤테이블. 조회 시 NULL일 수 있음.' COLLATE 'utf8mb4_general_ci',
	`target_id` VARCHAR(100) NULL DEFAULT NULL COMMENT '어떤테이블의 PK. 복합키일 경우 파이프라인(|)으로 구분해서 넣기' COLLATE 'utf8mb4_general_ci',
	`old_values` LONGTEXT NULL DEFAULT NULL COMMENT '조회 및 수정 전 값' COLLATE 'utf8mb4_general_ci',
	`new_values` LONGTEXT NULL DEFAULT NULL COMMENT '수정 후 값' COLLATE 'utf8mb4_general_ci',
	`reason` TEXT NULL DEFAULT NULL COMMENT '행위의 이유' COLLATE 'utf8mb4_general_ci',
	`created` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT '이력 발생 시각',
	PRIMARY KEY (`log_no`) USING BTREE
)
COMMENT='이력테이블'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=285
;


/*
사용자 테이블
*/

CREATE TABLE `manager` (
	`no` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'manager PK',
	`school_no` BIGINT(20) UNSIGNED NOT NULL COMMENT 'rnSchool PK',
	`login_id` VARCHAR(16) NOT NULL COMMENT 'login_id' COLLATE 'utf8mb4_general_ci',
	`name` VARCHAR(20) NOT NULL COMMENT '이름' COLLATE 'utf8mb4_general_ci',
	`passwd` TEXT NULL DEFAULT NULL COMMENT '비밀번호 (해시된)' COLLATE 'utf8mb4_general_ci',
	`created` DATETIME NOT NULL DEFAULT current_timestamp(),
	`updated` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`no`) USING BTREE
)
COMMENT='사용자'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=6
;


/*
사용자 그룹 테이블
*/

CREATE TABLE `managerGroup` (
	`group_no` BIGINT(20) UNSIGNED NOT NULL COMMENT '그룹 번호',
	`no` BIGINT(20) UNSIGNED NOT NULL COMMENT '사용자 번호',
	`created` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
	`updated` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
	`deleted` DATETIME NULL DEFAULT NULL COMMENT '삭제일시'
)
COMMENT='사용자 그룹'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;


/*
권한 테이블
*/

CREATE TABLE `permission` (
	`permission_no` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '권한 번호',
	`name` VARCHAR(20) NOT NULL COMMENT '권한 이름' COLLATE 'utf8mb4_general_ci',
	`description` TEXT NULL DEFAULT NULL COMMENT '권한 설명' COLLATE 'utf8mb4_general_ci',
	`default_extra_condition` VARCHAR(50) NULL DEFAULT NULL COMMENT '추가 조건 기본값' COLLATE 'utf8mb4_general_ci',
	`default_extra_limit` VARCHAR(50) NULL DEFAULT NULL COMMENT '추가 조건 제약' COLLATE 'utf8mb4_general_ci',
	`created` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
	`updated` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
	`deleted` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
	PRIMARY KEY (`permission_no`) USING BTREE
)
COMMENT='권한'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=209
;


/*
센서 데이터 테이블
*/

CREATE TABLE `rnData` (
	`mac` VARCHAR(16) NOT NULL COLLATE 'utf8mb3_unicode_ci',
	`t` DATETIME NOT NULL COMMENT 'Detect Time',
	`c` TINYINT(4) NOT NULL DEFAULT '0' COMMENT 'Count of Columns',
	`q` VARCHAR(4) NULL DEFAULT NULL COMMENT 'C000 or P00n' COLLATE 'utf8mb3_unicode_ci',
	`v` TEXT NULL DEFAULT NULL COMMENT 'Value' COLLATE 'utf8mb3_unicode_ci',
	`s` DATETIME NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`mac`, `t`) USING BTREE,
	INDEX `idx_s` (`s`) USING BTREE,
	INDEX `t` (`t`) USING BTREE
)
COLLATE='utf8mb3_unicode_ci'
ENGINE=InnoDB
;


/*
센서 테이블
*/

CREATE TABLE `rnDevices` (
	`mac` VARCHAR(16) NOT NULL COLLATE 'utf8mb3_unicode_ci',
	`model` VARCHAR(16) NOT NULL DEFAULT '' COLLATE 'utf8mb3_unicode_ci',
	`ip` VARCHAR(16) NULL DEFAULT NULL COLLATE 'utf8mb3_unicode_ci',
	`rip` VARCHAR(16) NULL DEFAULT NULL COMMENT 'remote' COLLATE 'utf8mb3_unicode_ci',
	`splrate` SMALLINT(6) NULL DEFAULT '0',
	`interval` SMALLINT(6) NULL DEFAULT '0',
	`ver` VARCHAR(24) NULL DEFAULT '' COLLATE 'utf8mb3_unicode_ci',
	`tags` TEXT NULL DEFAULT NULL COLLATE 'utf8mb3_unicode_ci',
	`checkin` DATETIME NULL DEFAULT NULL,
	`created` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT 'ìƒì„±ì¼ì‹œ',
	PRIMARY KEY (`mac`) USING BTREE
)
COLLATE='utf8mb3_unicode_ci'
ENGINE=InnoDB
;


/*
센서 관계 테이블
*/

CREATE TABLE `rnDevicesRel` (
	`school_no` INT(11) NOT NULL,
	`mac` VARCHAR(16) NOT NULL COLLATE 'utf8mb3_unicode_ci',
	`name` TEXT NULL DEFAULT NULL COMMENT '센서명칭' COLLATE 'utf8mb3_unicode_ci',
	`summary` TEXT NULL DEFAULT NULL COMMENT '설명' COLLATE 'utf8mb3_unicode_ci',
	`kind` INT(11) NULL DEFAULT '0' COMMENT '센서종류',
	`extra` TEXT NULL DEFAULT NULL COMMENT 'Extra Tags' COLLATE 'utf8mb3_unicode_ci',
	`sdate` DATETIME NULL DEFAULT NULL COMMENT '사용 시작',
	`edate` DATETIME NULL DEFAULT NULL COMMENT '사용 종료',
	`created` DATETIME NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`school_no`, `mac`) USING BTREE,
	INDEX `mac` (`mac`) USING BTREE
)
COLLATE='utf8mb3_unicode_ci'
ENGINE=InnoDB
;


/*
학교 테이블
*/

CREATE TABLE `rnSchool` (
	`school_no` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`sname` VARCHAR(80) NOT NULL COMMENT '학교명' COLLATE 'utf8mb3_unicode_ci',
	`scode` VARCHAR(10) NOT NULL COMMENT '학교코드' COLLATE 'utf8mb3_unicode_ci',
	`area` VARCHAR(16) NOT NULL COMMENT '지역명(e.g: daejeon)' COLLATE 'utf8mb3_unicode_ci',
	`modbus` SMALLINT(5) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'PLC 제공업체',
	`modbus_host` VARCHAR(20) NULL DEFAULT NULL COMMENT 'PLC 주소' COLLATE 'utf8mb3_unicode_ci',
	`modbus_port` SMALLINT(5) UNSIGNED NOT NULL DEFAULT '502' COMMENT 'PLC 포트',
	`use_os` ENUM('Y','N') NULL DEFAULT 'N' COMMENT '작업지시서 사용유무' COLLATE 'utf8mb3_unicode_ci',
	`active` ENUM('Y','N') NOT NULL DEFAULT 'Y' COLLATE 'utf8mb3_unicode_ci',
	`parent_no` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
	`created` DATETIME NULL DEFAULT current_timestamp() COMMENT '생성일',
	`administrationcode` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb3_unicode_ci',
	PRIMARY KEY (`school_no`) USING BTREE,
	INDEX `scode` (`scode`) USING BTREE
)
COLLATE='utf8mb3_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=52
;
