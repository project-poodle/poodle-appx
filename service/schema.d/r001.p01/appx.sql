DROP TABLE IF EXISTS `appx`.`_appx_meta`;
DROP TABLE IF EXISTS `appx`.`_role_scope`;
DROP TABLE IF EXISTS `appx`.`_role_grant`;
DROP TABLE IF EXISTS `appx`.`_perm_func`;
DROP TABLE IF EXISTS `appx`.`_perm_obj`;
DROP TABLE IF EXISTS `appx`.`namespace`;
DROP TABLE IF EXISTS `appx`.`namespace_status`;
DROP TABLE IF EXISTS `appx`.`env`;
DROP TABLE IF EXISTS `appx`.`env_status`;
DROP TABLE IF EXISTS `appx`.`app`;
DROP TABLE IF EXISTS `appx`.`app_status`;
DROP TABLE IF EXISTS `appx`.`deployment`;
DROP TABLE IF EXISTS `appx`.`deployment_status`;
DROP TABLE IF EXISTS `appx`.`obj`;
DROP TABLE IF EXISTS `appx`.`obj_status`;
DROP TABLE IF EXISTS `appx`.`attr`;
DROP TABLE IF EXISTS `appx`.`attr_status`;
DROP TABLE IF EXISTS `appx`.`relation`;
DROP TABLE IF EXISTS `appx`.`relation_status`;
DROP TABLE IF EXISTS `appx`.`api`;
DROP TABLE IF EXISTS `appx`.`api_status`;
DROP TABLE IF EXISTS `appx`.`transform`;
DROP TABLE IF EXISTS `appx`.`transform_status`;

CREATE TABLE IF NOT EXISTS `appx`.`_appx_meta` (
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

CREATE TABLE IF NOT EXISTS `appx`.`_role_scope` (
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

CREATE TABLE IF NOT EXISTS `appx`.`_role_grant` (
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

CREATE TABLE IF NOT EXISTS `appx`.`_perm_func` (
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

CREATE TABLE IF NOT EXISTS `appx`.`_perm_obj` (
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

CREATE TABLE IF NOT EXISTS `appx`.`namespace` (
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

CREATE TABLE IF NOT EXISTS `appx`.`namespace_status` (
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

CREATE TABLE IF NOT EXISTS `appx`.`env` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
    `env_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `appx`.`env_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
    `env_state`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `appx`.`app` (
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

CREATE TABLE IF NOT EXISTS `appx`.`app_status` (
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

CREATE TABLE IF NOT EXISTS `appx`.`deployment` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS `appx`.`deployment_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS `appx`.`obj` (
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

CREATE TABLE IF NOT EXISTS `appx`.`obj_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS `appx`.`relation` (
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

CREATE TABLE IF NOT EXISTS `appx`.`relation_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS `appx`.`attr` (
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

CREATE TABLE IF NOT EXISTS `appx`.`attr_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS `appx`.`api` (
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

CREATE TABLE IF NOT EXISTS `appx`.`api_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS `appx`.`transform` (
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

CREATE TABLE IF NOT EXISTS `appx`.`transform_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `env_name`              VARCHAR(15)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `src_namespace`         VARCHAR(32)             NOT NULL,
    `src_env_name`          VARCHAR(15)             NOT NULL,
    `src_app_name`          VARCHAR(15)             NOT NULL,
    `src_app_ver`           VARCHAR(32)             NOT NULL,
    `src_obj_name`          VARCHAR(32)             NOT NULL,
    `transform_name`        VARCHAR(32)             NOT NULL,
    `transform_state`       JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver, obj_name, src_namespace, src_env_name, src_app_name, src_app_ver, src_obj_name, transform_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(namespace, app_name) PARTITIONS 10;

INSERT INTO `appx`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.version',       'r001.p01',                     JSON_OBJECT('comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
INSERT INTO `appx`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.schema',        'prefix',                       JSON_OBJECT('value', '{{appx.init.schema_prefix}}', 'comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
INSERT INTO `appx`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.schema',        'separator',                    JSON_OBJECT('value', '{{appx.init.schema_separator}}', 'comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
INSERT INTO `appx`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('appx.local_auth',    '{{appx.init.admin_user}}',     JSON_OBJECT('password', PASSWORD("{{appx.init.admin_pass}}"), 'comment', 'initialize')) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);

INSERT INTO `appx`.`_role_scope`(`scope_name`, `scope_spec`) VALUES ('appx.local_auth', '{"comment": "initialize"}') ON DUPLICATE KEY UPDATE scope_spec=VALUES(scope_spec);
INSERT INTO `appx`.`_role_grant`(`role_name`, `grant_scope`, `grant_name`, `grant_spec`) VALUES ('appx.superadmin', 'appx.local_auth', 'appx', '{"comment": "initialize"}') ON DUPLICATE KEY UPDATE grant_spec=VALUES(grant_spec);
