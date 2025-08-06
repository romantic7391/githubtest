DROP DATABASE IF EXISTS airdb;
CREATE DATABASE IF NOT EXISTS airdb
	CHARACTER SET = 'utf8mb4'
	COLLATE = 'utf8mb4_uca1400_ai_ci';

USE airdb;

/*
지역 좌표 테이블
*/
CREATE TABLE `AreaData` (
  `area_no` bigint(20) NOT NULL AUTO_INCREMENT,
  `area` varchar(50) DEFAULT NULL,
  `X` bigint(20) DEFAULT NULL,
  `Y` bigint(20) DEFAULT NULL,
  `areacode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`area_no`)
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_uca1400_ai_ci
COMMENT='지역 좌표 테이블'
;

/*
그룹 테이블
*/
CREATE TABLE `group` (
  `group_no` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '그룹 번호',
  `school_no` bigint(20) unsigned DEFAULT NULL COMMENT '학교 번호',
  `name` varchar(20) NOT NULL COMMENT '그룹 이름',
  `parent_group_no` bigint(20) DEFAULT NULL COMMENT '부모 그룹 번호',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `deleted` datetime DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`group_no`) USING BTREE
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='그룹'
;

/*
그룹 권한 테이블
*/
CREATE TABLE `groupPermission` (
  `group_no` bigint(20) unsigned NOT NULL COMMENT '그룹 번호',
  `permission_no` bigint(20) unsigned NOT NULL COMMENT '권한 번호',
  `is_allowed` char(1) NOT NULL DEFAULT 'N' COMMENT '허용 여부 (Y/N)',
  `override` char(1) DEFAULT NULL COMMENT '허용 여부 (Y/N). override가 NULL이 아니면 해당 권한은 여기서부터 처리한다.',
  `extra_condition` longtext DEFAULT NULL COMMENT '추가 조건',
  `extra_limit` varchar(50) DEFAULT NULL COMMENT '추가 조건 제약',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `deleted` datetime DEFAULT NULL COMMENT '삭제일시'
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='그룹 권한'
;

/*
이력 테이블
*/
CREATE TABLE `history` (
  `log_no` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '로그 PK',
  `manager_no` bigint(20) unsigned DEFAULT NULL COMMENT '회원 PK',
  `school_no` bigint(20) unsigned DEFAULT 0 COMMENT '학교 PK',
  `ip` varchar(45) DEFAULT NULL COMMENT '행위 발생 IP (IPv4/IPv6)',
  `user_agent` text DEFAULT NULL COMMENT 'User-Agent',
  `action_type` varchar(1) NOT NULL COMMENT '조회(S), 추가(I), 수정(U), 삭제(D)',
  `target_table` varchar(50) DEFAULT NULL COMMENT '어떤테이블. 조회 시 NULL일 수 있음.',
  `target_id` varchar(100) DEFAULT NULL COMMENT '어떤테이블의 PK. 복합키일 경우 파이프라인(|)으로 구분해서 넣기',
  `old_values` longtext DEFAULT NULL COMMENT '조회 및 수정 전 값',
  `new_values` longtext DEFAULT NULL COMMENT '수정 후 값',
  `reason` text DEFAULT NULL COMMENT '행위의 이유',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT '이력 발생 시각',
  PRIMARY KEY (`log_no`) USING BTREE
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='작업 이력'
;

/*
사용자 테이블
*/
CREATE TABLE `manager` (
  `no` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'manager PK',
  `school_no` bigint(20) unsigned NOT NULL COMMENT 'rnSchool PK',
  `login_id` varchar(16) NOT NULL COMMENT 'login_id',
  `name` varchar(20) NOT NULL COMMENT '이름',
  `passwd` text DEFAULT NULL COMMENT '비밀번호 (해시된)',
  `salt` varchar(255) DEFAULT NULL COMMENT '비밀번호 salt',
  `last_passwd_changed` datetime DEFAULT NULL COMMENT '마지막 비밀번호 변경 일시',
  `login_attempt_count` tinyint(3) unsigned NOT NULL DEFAULT 0 COMMENT '로그인 시도 횟수',
  `approved_status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT '계정 승인 상태.',
  `locked` enum('Y','N') NOT NULL DEFAULT 'N' COMMENT '계정 잠금 여부',
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`no`) USING BTREE
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='사용자'
;

/*
사용자 그룹 테이블
*/
CREATE TABLE `managerGroup` (
  `group_no` bigint(20) unsigned NOT NULL COMMENT '그룹 번호',
  `no` bigint(20) unsigned NOT NULL COMMENT '사용자 번호',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `deleted` datetime DEFAULT NULL COMMENT '삭제일시'
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='사용자 그룹'
;

/*
사용자 로그인 이력 테이블
*/
CREATE TABLE `manager_login_history` (
  `idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `no` bigint(20) unsigned NOT NULL,
  `login_time` datetime NOT NULL DEFAULT current_timestamp(),
  `logout_time` datetime DEFAULT NULL,
  `success` enum('Y','N','F') DEFAULT NULL COMMENT 'Yes, No, Fail',
  `remote_addr` int(10) unsigned NOT NULL DEFAULT inet_aton('127.0.0.1') COMMENT 'Remote Address',
  `login_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idx`),
  KEY `mno` (`no`,`login_time`)
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='사용자 로그인 이력'
;

/*
권한 테이블
*/
CREATE TABLE `permission` (
  `permission_no` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '권한 번호',
  `name` varchar(20) NOT NULL COMMENT '권한 이름',
  `description` text DEFAULT NULL COMMENT '권한 설명',
  `default_extra_condition` varchar(50) DEFAULT NULL COMMENT '추가 조건 기본값',
  `default_extra_limit` varchar(50) DEFAULT NULL COMMENT '추가 조건 제약',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `deleted` datetime DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`permission_no`) USING BTREE
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='권한'
;

/*
센서 데이터 테이블
*/
CREATE TABLE `rnData` (
  `mac` varchar(16) NOT NULL,
  `t` datetime NOT NULL COMMENT 'Detect Time',
  `c` tinyint(4) NOT NULL DEFAULT 0 COMMENT 'Count of Columns',
  `q` varchar(4) DEFAULT NULL COMMENT 'C000 or P00n',
  `v` text DEFAULT NULL COMMENT 'Value',
  `s` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`mac`,`t`),
  KEY `idx_s` (`s`),
  KEY `t` (`t`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_unicode_ci
COMMENT='센서 데이터'
;

/*
센서 장치 테이블
*/
CREATE TABLE `rnDevices` (
  `mac` varchar(16) NOT NULL,
  `model` varchar(16) NOT NULL DEFAULT '',
  `ip` varchar(16) DEFAULT NULL,
  `rip` varchar(16) DEFAULT NULL COMMENT 'remote',
  `splrate` smallint(6) DEFAULT 0,
  `interval` smallint(6) DEFAULT 0,
  `ver` varchar(24) DEFAULT '',
  `tags` text DEFAULT NULL,
  `checkin` datetime DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  PRIMARY KEY (`mac`) USING BTREE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_unicode_ci
COMMENT='센서 장치'
;

/*
센서 관계 테이블
*/
CREATE TABLE `rnDevicesRel` (
  `school_no` int(11) NOT NULL,
  `mac` varchar(16) NOT NULL,
  `name` text DEFAULT NULL COMMENT '센서명칭',
  `summary` text DEFAULT NULL COMMENT '설명',
  `kind` int(11) DEFAULT 0 COMMENT '센서종류',
  `extra` text DEFAULT NULL COMMENT 'Extra Tags',
  `sdate` datetime DEFAULT NULL COMMENT '사용 시작',
  `edate` datetime DEFAULT NULL COMMENT '사용 종료',
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`school_no`,`mac`) USING BTREE,
  KEY `mac` (`mac`) USING BTREE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_unicode_ci
COMMENT='센서 관계'
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
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='학교'
;

-- ------------------------------------------------------------

CREATE TABLE `Collection` (
  `seq` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `scode` varchar(10) NOT NULL COMMENT '학교코드',
  `sid` varchar(9) NOT NULL COMMENT '자체코드',
  `gas` decimal(6,2) NOT NULL DEFAULT 0.00 COMMENT 'gas',
  `dust` decimal(6,2) NOT NULL DEFAULT 0.00 COMMENT 'dust',
  `co2` decimal(6,2) NOT NULL DEFAULT 0.00 COMMENT 'co2',
  `temp` decimal(6,2) NOT NULL DEFAULT 0.00 COMMENT 'temperature',
  `hu` decimal(6,2) NOT NULL DEFAULT 0.00 COMMENT 'humidity',
  `detected` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '검출일시',
  `created` datetime DEFAULT NULL COMMENT '등록일시',
  PRIMARY KEY (`seq`),
  KEY `idx_sc` (`scode`,`detected`)
) 
ENGINE=MyISAM
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
COMMENT='Collection'
;

CREATE TABLE `SchoolSettings` (
  `school_no` bigint(20) unsigned NOT NULL,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(100) NOT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `unique_school_setting` (`school_no`,`setting_key`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_uca1400_ai_ci
COMMENT='SchoolSettings'
;

CREATE TABLE `SensorData` (
  `time` bigint(20) unsigned NOT NULL COMMENT '검출시간',
  `sensorid` varchar(11) NOT NULL COMMENT '자체코드',
  `ev1` decimal(5,2) DEFAULT NULL COMMENT '외부 온도1(Celsius)',
  `ev2` decimal(5,2) DEFAULT NULL COMMENT '외부 온도2(Celsius)',
  `tv` decimal(5,2) DEFAULT NULL COMMENT '온도(Celsius)',
  `hv` decimal(5,2) DEFAULT NULL COMMENT '습도(%)',
  PRIMARY KEY (`sensorid`,`time`)
)
ENGINE=MyISAM
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
COMMENT='SensorData'
;

CREATE TABLE `plcAgents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(32) NOT NULL COMMENT 'Android UUID',
  `sc` bigint(20) unsigned NOT NULL COMMENT '학교번호',
  `created` datetime NOT NULL COMMENT '생성일시',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`,`sc`)
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_unicode_ci
COMMENT='plcAgents'
;

CREATE TABLE `plcData` (
  `sc` bigint(20) unsigned NOT NULL COMMENT '',
  `plckey` bigint(20) unsigned NOT NULL COMMENT 'plcKeys.id',
  `time` datetime NOT NULL DEFAULT current_timestamp() COMMENT '',
  `addrs` varchar(16) DEFAULT NULL COMMENT 'id-fc-addr[-bit]',
  `agent` bigint(20) unsigned NOT NULL COMMENT 'plcAgents.id',
  `value` text DEFAULT NULL COMMENT '',
  PRIMARY KEY (`sc`,`plckey`,`time`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_unicode_ci
COMMENT='plcData'
;

CREATE TABLE `plcKeys` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT 'Data Name',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
)
ENGINE=InnoDB
AUTO_INCREMENT=0
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_unicode_ci
COMMENT='plcKeys'
;

CREATE TABLE `properties` (
  `pkey` varchar(64) NOT NULL COMMENT 'Key',
  `pval` text DEFAULT NULL COMMENT 'Value',
  PRIMARY KEY (`pkey`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='properties'
;

CREATE TABLE `schoolDrawings` (
  `school_no` bigint(20) unsigned NOT NULL,
  `drawing_type` varchar(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `unique_school_drawing` (`school_no`,`drawing_type`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_uca1400_ai_ci
COMMENT='schoolDrawings'
;

CREATE TABLE `schoolMeals` (
  `school_no` bigint(20) unsigned NOT NULL,
  `dis_date` date NOT NULL,
  `dis_kind` enum('M','L','E') NOT NULL,
  `foods` text DEFAULT NULL,
  `modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`school_no`,`dis_date`,`dis_kind`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='schoolMeals'
;