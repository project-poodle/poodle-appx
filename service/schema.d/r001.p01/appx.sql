DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`_appx_meta`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`_role_scope`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`_role_grant`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`_perm_func`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`_perm_obj`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`namespace`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`namespace_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`env`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`env_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`app`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`app_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`deployment`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`deployment_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`obj`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`obj_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`attr`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`attr_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`relation`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`relation_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`api`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`api_status`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`transform`;
DROP TABLE IF EXISTS `{{{APPX.global.schema_prefix}}}`.`transform_status`;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`_appx_meta` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `meta_name`             VARCHAR(32)             NOT NULL,
    `meta_key`              VARCHAR(32)             NOT NULL,
    `meta_info`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_metadata(meta_name, meta_key),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`_role_scope` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `scope_name`            VARCHAR(32)             NOT NULL,
    `scope_spec`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(scope_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`_role_grant` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `role_name`             VARCHAR(32)             NOT NULL,
    `grant_scope`           VARCHAR(32)             NOT NULL,
    `grant_name`            VARCHAR(32)             NOT NULL,
    `grant_spec`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(role_name, grant_scope, grant_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`_perm_func` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `role_name`             VARCHAR(32)             NOT NULL,
    `func_scope`            VARCHAR(32)             NOT NULL,
    `func_name`             VARCHAR(32)             NOT NULL,
    `func_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(role_name, func_scope, func_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`_perm_obj` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `role_name`             VARCHAR(32)             NOT NULL,
    `obj_scope`             VARCHAR(32)             NOT NULL,
    `obj_key`               VARCHAR(32)             NOT NULL,
    `obj_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(role_name, obj_scope, obj_key),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`namespace` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `namespace_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`namespace_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `namespace_state`       JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`env` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `env_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`env_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `env_state`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`app` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`app_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_state`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`deployment` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `deployment_spec`       JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`deployment_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `deployment_status`     JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`obj` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`obj_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_state`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver, obj_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`relation` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `objn_name`             VARCHAR(32)             NOT NULL,
    `objn_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, objn_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`relation_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `objn_name`             VARCHAR(32)             NOT NULL,
    `objn_state`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver, obj_name, objn_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`attr` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `attr_name`             VARCHAR(32)             NOT NULL,
    `attr_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, attr_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`attr_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `attr_name`             VARCHAR(32)             NOT NULL,
    `attr_state`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver, obj_name, attr_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`api` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(15)             NOT NULL,
    `api_endpoint`          VARCHAR(255)            NOT NULL,
    `api_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, api_method, api_endpoint),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`api_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(15)             NOT NULL,
    `api_endpoint`          VARCHAR(255)            NOT NULL,
    `api_state`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver, obj_name, api_method, api_endpoint),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`transform` (
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
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, app_name, app_ver, obj_name, src_namespace, src_app_name, src_app_ver, src_obj_name, transform_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

CREATE TABLE IF NOT EXISTS `{{{APPX.global.schema_prefix}}}`.`transform_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `transform_name`        VARCHAR(32)             NOT NULL,
    `transform_state`       JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver, obj_name, transform_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

-- metadata --
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.version',       '{{{global.version}}}',           JSON_OBJECT('comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.schema',        'prefix',                         JSON_OBJECT('value', '{{appx.init.schema_prefix}}', 'comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.schema',        'separator',                      JSON_OBJECT('value', '{{appx.init.schema_separator}}', 'comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.local_auth',    '{{appx.init.admin_user}}',       JSON_OBJECT('password', PASSWORD("{{appx.init.admin_pass}}"), 'comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);

-- role definitions --
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`_role_scope`(`scope_name`, `scope_spec`) VALUES ('appx.local_auth', '{"comment": "initialize"}') ON DUPLICATE KEY UPDATE scope_spec=VALUES(scope_spec);
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`_role_grant`(`role_name`, `grant_scope`, `grant_name`, `grant_spec`) VALUES ('appx.superadmin', 'appx.local_auth', 'appx', '{"comment": "initialize"}') ON DUPLICATE KEY UPDATE grant_spec=VALUES(grant_spec);

-- initialize global data --
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`namespace`  (`namespace`, `namespace_spec`)                             VALUES ('sys', JSON_OBJECT('comment', 'initialize'))                                              ON DUPLICATE KEY UPDATE namespace_spec=VALUES(namespace_spec)
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`app`        (`namespace`, `app`, `app_ver`, `app_spec`)                 VALUES ('sys', 'appx', '{{{global.version}}}', JSON_OBJECT('comment', 'initialize'))              ON DUPLICATE KEY UPDATE app_spec=VALUES(app_spec)
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`env`        (`namespace`, `env`, `env_spec`)                            VALUES ('sys', 'internal', JSON_OBJECT('comment', 'initialize'))                                  ON DUPLICATE KEY UPDATE env_spec=VALUES(env_spec)
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`deployment` (`namespace`, `env`, `app`, `app_ver`, `deployment_spec`)   VALUES ('sys', 'internal', 'appx', '{{{global.version}}}', JSON_OBJECT('comment', 'initialize'))  ON DUPLICATE KEY UPDATE app_ver=VALUES(app_ver), deployment_spec=VALUES(deployment_spec)

-- initialize object and relation data --
INSERT INTO `{{{APPX.global.schema_prefix}}}`.`object`  (`namespace`, `app`, `app_ver`, `obj_name`, `obj_spec`)        VALUES ('sys', 'appx', '{{{global.version}}}', 'namespace', JSON_OBJECT('comment', 'initialize'))                        ON DUPLICATE KEY UPDATE namespace_spec=VALUES(namespace_spec)
