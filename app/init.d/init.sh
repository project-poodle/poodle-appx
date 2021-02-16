#!/usr/bin/env bash

##############################
# check parameters
if [ "$1" = "" ]; then
    echo "Usage: $0 <init_yaml_filepath>"
    exit 1
elif [ ! -f "$1" ]; then
    echo "ERROR: init yaml file NOT exist: $1 !"
    exit 1
fi

##############################
# env setup
pushd `pwd` > /dev/null
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/..
export INIT_ORIG=${CURR_DIR}/init.yaml
source ${BASE_DIR}/common.d/func.sh
popd > /dev/null

# check_root

##############################
# override args

env_var_update $INIT_ORIG

##############################
# generate and install templates
rm -fR /tmp/$$
mkdir -p /tmp/$$

echo "--------------------"
mkdir -p ${BASE_DIR}/conf.d
# chown ${appx__init__service_id_appx}:${appx__init__service_grp_appx} ${BASE_DIR}/conf.d
chmod 755 ${BASE_DIR}/conf.d

umask 077

echo "--------------------"
eval_template -t ${CURR_DIR}/init.yaml -y1 ${CURR_DIR}/init.yaml > /tmp/$$/init.yaml
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate init.yaml ! --- [/tmp/$$/]"
    exit 1
fi
export INIT_YAML=/tmp/$$/init.yaml

parse_yaml "${INIT_YAML}" > /tmp/$$/env.sh
source /tmp/$$/env.sh

# echo "------------------------------------------------------------"
# cat $INIT_YAML
# echo "------------------------------------------------------------"

# echo "--------------------"
# eval_template -t ${CURR_DIR}/`uname`/init.template.sh -y1 ${INIT_YAML} > /tmp/$$/init.`uname`.sh
# if [ $? -ne 0 ]; then
#     echo "ERROR: failed to generate init.`uname`.yaml ! --- [/tmp/$$/]"
#     exit 1
# fi
# bash -x /tmp/$$/init.`uname`.sh > /tmp/$$/init.`uname`.log

echo "--------------------"
MYSQL_ADMIN_FILE=${BASE_DIR}/conf.d/mysql_admin.json
eval_template -t ${CURR_DIR}/mysql_admin.json -y1 ${INIT_YAML} > ${MYSQL_ADMIN_FILE}
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate ${MYSQL_ADMIN_FILE} ! --- [/tmp/$$/]"
    exit 1
fi
# chown ${appx__init__service_usr_admin}:${appx__init__service_grp_admin} ${MYSQL_ADMIN_FILE}
chmod 644 ${MYSQL_ADMIN_FILE}

# echo "------------------------------------------------------------"
# cat $MYSQL_ADMIN_FILE
# echo "------------------------------------------------------------"

# LOG_DIR_MYSQL=/var/log/appx-mysql/
LOG_DIR_MYSQL=${BASE_DIR}/log.d/appx-mysql/
mkdir -p ${LOG_DIR_MYSQL}
# chown ${appx__init__service_usr_admin}:${appx__init__service_grp_admin} ${LOG_DIR_MYSQL}
chmod -R go-rwx ${BASE_DIR}


echo "--------------------"
MYSQL_APPX_FILE=${BASE_DIR}/conf.d/mysql_appx.json
eval_template -t ${CURR_DIR}/mysql_appx.json -y1 ${INIT_YAML} > ${MYSQL_APPX_FILE}
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate ${MYSQL_APPX_FILE} ! --- [/tmp/$$/]"
    exit 1
fi
# chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} ${MYSQL_APPX_FILE}
chmod 644 ${MYSQL_APPX_FILE}

LOG_DIR=${BASE_DIR}/log.d/appx/
mkdir -p ${LOG_DIR}
# chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} ${LOG_DIR}
chmod -R go=rX ${LOG_DIR}

echo "--------------------"
LDAP_APPX_FILE=${BASE_DIR}/conf.d/ldap_appx.json
eval_template -t ${CURR_DIR}/ldap_appx.json -y1 ${INIT_YAML} > ${LDAP_APPX_FILE}
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate ${LDAP_APPX_FILE} ! --- [/tmp/$$/]"
    exit 1
fi
# chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} ${LDAP_APPX_FILE}
chmod 644 ${LDAP_APPX_FILE}

echo "--------------------"
MOUNT_APPX_FILE=${BASE_DIR}/conf.d/mount_appx.json
eval_template -t ${CURR_DIR}/mount_appx.json -y1 ${INIT_YAML} > ${MOUNT_APPX_FILE}
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate ${MOUNT_APPX_FILE} ! --- [/tmp/$$/]"
    exit 1
fi
# chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} ${MOUNT_APPX_FILE}
chmod 644 ${MOUNT_APPX_FILE}

echo "--------------------"
echo "INFO: Checking Connection to DB"
MAX_CHECKS=5; try=0;
while true
    do
        eval_mysql_admin -p -e "SELECT version()"
        if [ $? -ne 0 ]; then
            echo "ERROR: Connection to DB Failed. Will retry in 30s. Number of retries [$try]"
            if [ $try == $MAX_CHECKS ]; then
                echo "ERROR: Connection to DB Failed. Number of retries [$try]. Max retries reached. Exiting"
                exit 1
            fi    
            try=$[$try+1]
            sleep 30
        else
            echo "INFO: Connection to DB Successful" 
            break
        fi
    done

echo "--------------------"
eval_mysql_admin -p -e "CREATE USER IF NOT EXISTS '${appx__init__mysql_node_user}'@'%' IDENTIFIED WITH mysql_native_password BY '${appx__init__mysql_node_pass}'"
if [ $? -ne 0 ]; then
    eval_mysql_admin -p -e "CREATE USER IF NOT EXISTS '${appx__init__mysql_node_user}'@'%' IDENTIFIED BY '${appx__init__mysql_node_pass}'"
    if [ $? -ne 0 ]; then
        echo "ERROR: mysql failed to create user: ${appx__init__mysql_node_user} ! --- [/tmp/$$/]"
        exit 1
    fi
fi

echo "--------------------"
eval_mysql_admin -p -e "CREATE DATABASE IF NOT EXISTS \`${appx__init__schema_prefix}\`"
if [ $? -ne 0 ]; then
    echo "ERROR: mysql failed to create schema: ${appx__init__schema_prefix} ! --- [/tmp/$$/]"
    exit 1
fi

echo "--------------------"
eval_mysql_admin -p -e "GRANT ALL PRIVILEGES ON \`${appx__init__schema_prefix}\`.* TO '${appx__init__mysql_node_user}'@'%'"
if [ $? -ne 0 ]; then
    echo "ERROR: mysql failed to grant privileges to user: ${appx__init__mysql_node_user} ! --- [/tmp/$$/]"
    exit 1
fi

echo "--------------------"
rm -fR /tmp/$$
