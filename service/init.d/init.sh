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
pushd `pwd`
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/..
source ${BASE_DIR}/common.d/func.sh
popd

check_root


##############################
# generate and install templates
rm -fR /tmp/$$
mkdir -p /tmp/$$

echo "===================="
mkdir -p ${BASE_DIR}/conf.d
chown ${appx__init__service_id_appx}:${appx__init__service_grp_appx} ${BASE_DIR}/conf.d
chmod 755 ${BASE_DIR}/conf.d

umask 077

echo "===================="
eval_template -t ${CURR_DIR}/init.yaml -y1 ${CURR_DIR}/init.yaml > /tmp/$$/init.yaml
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate init.yaml !"
    exit 1
fi
export INIT_YAML=/tmp/$$/init.yaml

parse_yaml "${INIT_YAML}" | tee /tmp/$$/env.sh
source /tmp/$$/env.sh

echo "===================="
eval_template -t ${CURR_DIR}/`uname`/init.template.sh -y1 ${INIT_YAML} > /tmp/$$/init.`uname`.sh
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate init.`uname`.yaml !"
    exit 1
fi
bash -x /tmp/$$/init.`uname`.sh

echo "===================="
MYSQL_ADMIN_FILE=${BASE_DIR}/conf.d/mysql_admin.json
eval_template -t ${CURR_DIR}/mysql_admin.json -y1 ${INIT_YAML} > ${MYSQL_ADMIN_FILE}
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate ${MYSQL_ADMIN_FILE} !"
    exit 1
fi
chown ${appx__init__service_usr_admin}:${appx__init__service_grp_admin} ${MYSQL_ADMIN_FILE}
chmod 600 ${MYSQL_ADMIN_FILE}

mkdir -p /var/log/appx-mysql/
chown ${appx__init__service_usr_admin}:${appx__init__service_grp_admin} /var/log/appx-mysql/
chmod -R ug-rwx /var/log/appx-mysql/


echo "===================="
MYSQL_APPX_FILE=${BASE_DIR}/conf.d/mysql_appx.json
eval_template -t ${CURR_DIR}/mysql_appx.json -y1 ${INIT_YAML} > ${MYSQL_APPX_FILE}
if [ $? -ne 0 ]; then
    echo "ERROR: failed to generate ${MYSQL_APPX_FILE} !"
    exit 1
fi
chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} ${MYSQL_APPX_FILE}
chmod 600 ${MYSQL_APPX_FILE}

mkdir -p /var/log/appx-node/
chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} /var/log/appx-node/
chmod -R ug=rX /var/log/appx-node/

echo "===================="
echo eval_mysql_admin -e "CREATE USER IF NOT EXISTS '${appx__init__mysql_node_user}'@'%' IDENTIFIED BY '${appx__init__mysql_node_pass}'"
eval_mysql_admin -e "CREATE USER IF NOT EXISTS '${appx__init__mysql_node_user}'@'%' IDENTIFIED BY '${appx__init__mysql_node_pass}'"
if [ $? -ne 0 ]; then
    echo "ERROR: mysql failed to create user: ${appx__init__mysql_node_user} !"
    exit 1
fi

echo "===================="
echo eval_mysql_admin -e "CREATE DATABASE IF NOT EXISTS \`${appx__init__schema_prefix}\`"
eval_mysql_admin -e "CREATE DATABASE IF NOT EXISTS \`${appx__init__schema_prefix}\`"
if [ $? -ne 0 ]; then
    echo "ERROR: mysql failed to create schema: ${appx__init__schema_prefix} !"
    exit 1
fi

echo "===================="
echo eval_mysql_admin -e "GRANT ALL PRIVILEGES ON \`${appx__init__schema_prefix}\`.* TO '${appx__init__mysql_node_user}'@'%'"
eval_mysql_admin -e "GRANT ALL PRIVILEGES ON \`${appx__init__schema_prefix}\`.* TO '${appx__init__mysql_node_user}'@'%'"
if [ $? -ne 0 ]; then
    echo "ERROR: mysql failed to grant privileges to user: ${appx__init__mysql_node_user} !"
    exit 1
fi

echo "----------"
rm -fR /tmp/$$
