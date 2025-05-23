
CREATE TABLE manager
(
  no        BIGINT(20)  NOT NULL AUTO_INCREMENT,
  school_no BIGINT(20)  NOT NULL COMMENT 'rnSchool.school_no',
  login_id  VARCHAR(16) NOT NULL COMMENT 'login_id',
  name      VARCHAR(20) NOT NULL COMMENT '이름',
  passwd    TEXT        NULL     DEFAULT NULL,
  created   DATETIME    NOT NULL DEFAULT current_timestamp,
  school_no BIGINT(20)  NOT NULL,
  updated   DATETIME    NULL     DEFAULT NULL,
  PRIMARY KEY (no)
) COMMENT '사용자';

CREATE INDEX school
  ON manager (school_no ASC);



CREATE TABLE manager_group
(
  group_no BIGINT     NOT NULL COMMENT '그룹 번호',
  no       BIGINT(20) NOT NULL COMMENT '사용자 번호',
  created  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  deleted  DATETIME   NULL     COMMENT '삭제일시'
) COMMENT '사용자 그룹';



CREATE TABLE group
(
  group_no        BIGINT      NOT NULL DEFAULT AUTO_INCREMENT, UNSIGNED COMMENT '그룹 번호',
  school_no       BIGINT      NOT NULL DEFAULT AUTO_INCREMENT, UNSIGNED COMMENT '학교 번호',
  name            VARCHAR(20) NOT NULL COMMENT '그룹 이름',
  parent_group_no BIGINT      NOT NULL DEFAULT UNSIGNED COMMENT '부모 그룹 번호',
  created         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  deleted         DATETIME    NULL     COMMENT '삭제일시',
  PRIMARY KEY (group_no)
) COMMENT '그룹';



CREATE TABLE group_permission
(
  group_no        BIGINT      NOT NULL DEFAULT AUTO_INCREMENT, UNSIGNED COMMENT '그룹 번호',
  permission_no   BIGINT      NOT NULL DEFAULT AUTO_INCREMENT, UNSIGNED COMMENT '권한 번호',
  is_allowed      VARCHAR(1)  NULL     COMMENT '허용 여부 ('Y': 허용됨, 'N': 허용 안됨)',
  extra_condition VARCHAR(50) NULL     COMMENT '추가 조건',
  extra_limit     VARCHAR(50) NULL     COMMENT '추가 조건 제약',
  created         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  deleted         DATETIME    NULL     COMMENT '삭제일시'
) COMMENT '그룹 권한';



CREATE TABLE permission
(
  permission_no           BIGINT      NOT NULL DEFAULT AUTO_INCREMENT, UNSIGNED COMMENT '권한 번호',
  name                    VARCHAR(20) NOT NULL COMMENT '권한 이름',
  description             TEXT        NULL     COMMENT '권한 설명',
  default_extra_condition VARCHAR(50) NULL     COMMENT '추가 조건 기본값',
  default_extra_limit     VARCHAR(50) NULL     COMMENT '추가 조건 제약',
  created                 DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated                 DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  deleted                 DATETIME    NULL     COMMENT '삭제일시',
  PRIMARY KEY (permission_no)
) COMMENT '권한';
