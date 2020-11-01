DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_appx_meta`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_user_local`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_auth_module`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_auth_grant`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_perm_func`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_perm_obj`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_spec_audit`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_state_audit`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_state_history`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`namespace`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`namespace_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`runtime`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`runtime_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`app`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`app_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`deployment`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`deployment_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`obj`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`obj_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`attr`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`attr_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`relation`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`relation_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`api`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`api_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`transform`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`transform_status`;

-- metadata --
CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_appx_meta` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `meta_name`             VARCHAR(32)             NOT NULL,
    `meta_key`              VARCHAR(32)             NOT NULL,
    `meta_info`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_metadata(`meta_name`, `meta_key`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- user(s) --
CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_user` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `scope_name`            VARCHAR(32)             NOT NULL,
    `username`              VARCHAR(32)             NOT NULL,
    `password`              VARCHAR(255)            NOT NULL,
    `user_info`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_metadata(`namespace`, `scope_name`, `username`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- roles and permissions --
CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_auth_module` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `auth_module`           VARCHAR(32)             NOT NULL,
    `auth_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(`auth_module`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_auth_grant` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `role_name`             VARCHAR(32)             NOT NULL,
    `auth_module`           VARCHAR(32)             NOT NULL,
    `auth_name`             VARCHAR(32)             NOT NULL,
    `grant_spec`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, role_name, auth_module, auth_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_perm_func` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `role_name`             VARCHAR(32)             NOT NULL,
    `func_scope`            VARCHAR(32)             NOT NULL,
    `func_name`             VARCHAR(32)             NOT NULL,
    `func_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, role_name, func_scope, func_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_perm_obj` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `role_name`             VARCHAR(32)             NOT NULL,
    `obj_scope`             VARCHAR(32)             NOT NULL,
    `obj_key`               VARCHAR(32)             NOT NULL,
    `obj_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, role_name, obj_scope, obj_key),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- auditing --
CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_spec_audit` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `spec_name`             VARCHAR(32)             NOT NULL,
    `spec_id`               BIGINT                  NOT NULL,
    `spec_audit`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `namespace`, `spec_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `spec_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_state_audit` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `state_name`            VARCHAR(32)             NOT NULL,
    `state_id`              BIGINT                  NOT NULL,
    `spec_audit`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `namespace`, `state_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `state_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`_state_history` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `state_name`            VARCHAR(32)             NOT NULL,
    `state_id`              BIGINT                  NOT NULL,
    `state_time`            DATETIME                NOT NULL,
    `state_history`         JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_state_history(namespace, state_name, state_id, state_time),
    PRIMARY KEY (`id`, `namespace`, `state_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `state_name`) PARTITIONS 20;

-- main schema --
CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`namespace` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `owner_scope`           VARCHAR(32)             NOT NULL,
    `owner_name`            VARCHAR(32)             NOT NULL,
    `namespace_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`namespace_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `namespace_state`       JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`runtime` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `runtime_spec`          JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`runtime_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `runtime_state`         JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`app` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`app_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_state`             JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`deployment` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `deployment_spec`       JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`deployment_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `deployment_state`      JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`obj` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`obj_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_state`             JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name, obj_name),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`relation` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `objn_name`             VARCHAR(32)             NOT NULL,
    `relation_spec`         JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, objn_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`relation_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `objn_name`             VARCHAR(32)             NOT NULL,
    `relation_state`        JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name, obj_name, objn_name),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`attr` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `attr_name`             VARCHAR(32)             NOT NULL,
    `attr_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, attr_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`attr_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `attr_name`             VARCHAR(32)             NOT NULL,
    `attr_state`            JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name, obj_name, attr_name),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`api` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(15)             NOT NULL,
    `api_endpoint`          VARCHAR(255)            NOT NULL,
    `api_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, api_method, api_endpoint),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`api_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(15)             NOT NULL,
    `api_endpoint`          VARCHAR(255)            NOT NULL,
    `api_state`             JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name, obj_name, api_method, api_endpoint),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`transform` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `src_namespace`         VARCHAR(32)             NOT NULL,
    `src_app_name`          VARCHAR(15)             NOT NULL,
    `src_app_ver`           VARCHAR(32)             NOT NULL,
    `src_obj_name`          VARCHAR(32)             NOT NULL,
    `transform_name`        VARCHAR(32)             NOT NULL,
    `transform_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, src_namespace, src_app_name, src_app_ver, src_obj_name, transform_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE IF NOT EXISTS `{{{global.schema_prefix}}}`.`transform_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `transform_name`        VARCHAR(32)             NOT NULL,
    `transform_state`       JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, runtime_name, app_name, obj_name, transform_name),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

-- metadata --
{{#_appx_meta}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('{{{meta_name}}}', '{{{meta_key}}}', {{#meta_info}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/meta_info}}) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
{{/.}}
{{/_appx_meta}}

-- local users --
{{#_user}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_user`(`namespace`, `scope_name`, `username`, `password`, `user_info`) VALUES ('{{{namespace}}}', '{{{scope_name}}}', '{{{username}}}', {{{password}}}, {{#user_info}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/user_info}}) ON DUPLICATE KEY UPDATE password=VALUES(password), user_info=VALUES(user_info);
{{/.}}
{{/_user}}

-- auth modules --
{{#_auth_module}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_auth_module`(`auth_module`, `auth_spec`) VALUES ('{{{auth_module}}}', {{#auth_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/auth_spec}}) ON DUPLICATE KEY UPDATE auth_spec=VALUES(auth_spec);
{{/.}}
{{/_auth_module}}

-- role definitions --
{{#_auth_grant}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_auth_grant`(`namespace`, `role_name`, `auth_module`, `auth_name`, `grant_spec`) VALUES ('{{{namespace}}}', '{{{role_name}}}', '{{{auth_module}}}', '{{{auth_name}}}', {{#grant_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/grant_spec}}) ON DUPLICATE KEY UPDATE grant_spec=VALUES(grant_spec);
{{/.}}
{{/_auth_grant}}

-- permission definitions --
{{#_perm_func}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_perm_func`(`namespace`, `role_name`, `func_scope`, `func_name`, `func_spec`) VALUES ('{{{namespace}}}', '{{{role_name}}}', '{{{func_scope}}}', '{{{func_name}}}', {{#func_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/func_spec}}) ON DUPLICATE KEY UPDATE func_spec=VALUES(func_spec);
{{/.}}
{{/_perm_func}}

-- namespace --
{{#namespace}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`namespace`(`namespace`, `owner_scope`, `owner_name`, `namespace_spec`) VALUES ('{{{namespace}}}', '{{{owner_scope}}}', '{{{owner_name}}}', {{#namespace_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/namespace_spec}}) ON DUPLICATE KEY UPDATE owner_scope=VALUES(owner_scope), owner_name=VALUES(owner_name), namespace_spec=VALUES(namespace_spec);
{{/.}}
{{/namespace}}

-- app --
{{#app}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`app`(`namespace`, `app_name`, `app_ver`, `app_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', {{#app_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/app_spec}}) ON DUPLICATE KEY UPDATE app_spec=VALUES(app_spec);
{{/.}}
{{/app}}

-- runtime --
{{#runtime}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`runtime`(`namespace`, `runtime_name`, `runtime_spec`) VALUES ('{{{namespace}}}', '{{{runtime_name}}}', {{#runtime_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/runtime_spec}}) ON DUPLICATE KEY UPDATE runtime_spec=VALUES(runtime_spec);
{{/.}}
{{/runtime}}

-- deployment --
{{#deployment}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`deployment`(`namespace`, `runtime_name`, `app_name`, `app_ver`, `deployment_spec`) VALUES ('{{{namespace}}}', '{{{runtime_name}}}', '{{{app_name}}}', '{{{app_ver}}}', {{#deployment_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/deployment_spec}})  ON DUPLICATE KEY UPDATE app_ver=VALUES(app_ver), deployment_spec=VALUES(deployment_spec);
{{/.}}
{{/deployment}}

-- obj --
{{#obj}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`obj`(`namespace`, `app_name`, `app_ver`, `obj_name`, `obj_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', {{#obj_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/obj_spec}}) ON DUPLICATE KEY UPDATE obj_spec=VALUES(obj_spec);
{{/.}}
{{/obj}}

-- relation --
{{#relation}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`relation`(`namespace`, `app_name`, `app_ver`, `obj_name`, `objn_name`, `relation_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{objn_name}}}', {{#relation_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/relation_spec}}) ON DUPLICATE KEY UPDATE relation_spec=VALUES(relation_spec);
{{/.}}
{{/relation}}

-- attr --
{{#attr}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`attr`(`namespace`, `app_name`, `app_ver`, `obj_name`, `attr_name`, `attr_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{attr_name}}}', {{#attr_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/attr_spec}}) ON DUPLICATE KEY UPDATE attr_spec=VALUES(attr_spec);
{{/.}}
{{/attr}}

-- api --
{{#api}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`api`(`namespace`, `app_name`, `app_ver`, `obj_name`, `api_method`, `api_endpoint`, `api_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{api_method}}}', '{{{api_endpoint}}}', {{#api_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/api_spec}}) ON DUPLICATE KEY UPDATE api_spec=VALUES(api_spec);
{{/.}}
{{/api}}
