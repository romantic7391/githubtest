-- 지역 관련 권한
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('지역_조회', '지역 목록 조회', NULL, NULL, NOW(), NOW(), NULL),
('지역_생성', '새로운 지역 생성', NULL, NULL, NOW(), NOW(), NULL),
('특정정지역_조회', '특정 지역 상세 조회', NULL, NULL, NOW(), NOW(), NULL),
('지역_수정', '기존 지역 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('지역_삭제', '지역 삭제', NULL, NULL, NOW(), NOW(), NULL);

-- 학교 관련 권한
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('학교_조회', '학교 목록 및 상세 조회', NULL, NULL, NOW(), NOW(), NULL),
('학교_생성', '새로운 학교 생성', NULL, NULL, NOW(), NOW(), NULL),
('학교_수정', '기존 학교 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('학교_삭제', '학교 삭제', NULL, NULL, NOW(), NOW(), NULL);

-- 센서 관련 권한
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('센서_조회', '센서 상세 정보 조회', NULL, NULL, NOW(), NOW(), NULL),
('센서_생성', '새로운 센서 등록', NULL, NULL, NOW(), NOW(), NULL),
('센서_수정', '기존 센서 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('센서_삭제', '센서 삭제', NULL, NULL, NOW(), NOW(), NULL),
('센서_목록_조회', '센서 목록 조회', NULL, NULL, NOW(), NOW(), NULL);

-- 권한 관리 (Permission) - 완료
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('권한_조회', '권한 목록 및 상세 조회', NULL, NULL, NOW(), NOW(), NULL),
('권한_생성', '새로운 권한 생성', NULL, NULL, NOW(), NOW(), NULL),
('권한_수정', '기존 권한 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('권한_삭제', '권한 삭제', NULL, NULL, NOW(), NOW(), NULL);

-- 그룹 관리 (Group) - 완료
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('그룹_조회', '그룹 목록 및 상세 조회', NULL, NULL, NOW(), NOW(), NULL),
('그룹_생성', '새로운 그룹 생성', NULL, NULL, NOW(), NOW(), NULL),
('그룹_수정', '기존 그룹 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('그룹_삭제', '그룹 삭제', NULL, NULL, NOW(), NOW(), NULL);

-- 그룹 권한 관리 (Group Permission) - 추가 필요
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('그룹권한_조회', '그룹별 권한 목록 조회', NULL, NULL, NOW(), NOW(), NULL),
('그룹권한_생성', '그룹에 권한 할당', NULL, NULL, NOW(), NOW(), NULL),
('그룹권한_수정', '그룹 권한 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('그룹권한_삭제', '그룹에서 권한 제거', NULL, NULL, NOW(), NOW(), NULL);

-- 관리자 그룹 관리 (Manager Group) - 추가 필요
INSERT INTO `permission` (`name`, `description`, `default_extra_condition`, `default_extra_limit`, `created`, `updated`, `deleted`) VALUES 
('사용자그룹_조회', '사용자 그룹 목록 조회', NULL, NULL, NOW(), NOW(), NULL),
('사용자그룹_생성', '사용자를 그룹에 할당', NULL, NULL, NOW(), NOW(), NULL),
('사용자그룹_수정', '사용자 그룹 정보 수정', NULL, NULL, NOW(), NOW(), NULL),
('사용자그룹_삭제', '사용자를 그룹에서 제거', NULL, NULL, NOW(), NOW(), NULL);