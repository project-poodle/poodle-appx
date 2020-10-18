DROP TABLE IF EXISTS `appx`.`_appx_meta`;
DROP TABLE IF EXISTS `appx`.`namespace`;
DROP TABLE IF EXISTS `appx`.`namespace_status`;
DROP TABLE IF EXISTS `appx`.`env`;
DROP TABLE IF EXISTS `appx`.`env_status`;
DROP TABLE IF EXISTS `appx`.`app`;
DROP TABLE IF EXISTS `appx`.`app_status`;
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
    `appx_name`             VARCHAR(32)             NOT NULL,
    `appx_key`              VARCHAR(32)             NOT NULL,
    `appx_info`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_metadata(appx_name, appx_key),
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
    `env_name`              VARCHAR(32)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
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
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_state`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_app(namespace, env_name, app_name, app_ver),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE IF NOT EXISTS `appx`.`obj` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
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
    `app_name`              VARCHAR(32)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(16)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(16)             NOT NULL,
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
    `app_name`              VARCHAR(32)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `src_namespace`         VARCHAR(32)             NOT NULL,
    `src_app_name`          VARCHAR(32)             NOT NULL,
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
    `env_name`              VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `src_namespace`         VARCHAR(32)             NOT NULL,
    `src_env_name`          VARCHAR(32)             NOT NULL,
    `src_app_name`          VARCHAR(32)             NOT NULL,
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

INSERT INTO `appx`.`_appx_meta`(`appx_name`, `appx_key`, `appx_info`) VALUES ('version', 'r001.p01', '{"comment": "initial version"}');
