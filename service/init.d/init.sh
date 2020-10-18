#!/usr/bin/env bash

if [ "$1" = "" ]; then
    echo "Usage: $0 <init_yaml_filepath>"
    exit 1
elif [ ! -f "$1" ]; then
    echo "ERROR: init yaml file NOT exist: $1 !"
    exit 1
else
    export init_yaml_filename="$1"
fi

cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/..

source ${BASE_DIR}/common.d/func.sh

check_root
check_node_binary


rm -fR /tmp/$$
mkdir -p /tmp/$$

echo "=========="
parse_yaml "${init_yaml_filename}" | tee /tmp/$$/env.sh
source /tmp/$$/env.sh

mkdir -p ${BASE_DIR}/conf.d
chown ${appx__init__service_id_appx}:${appx__init__service_grp_appx} ${BASE_DIR}/conf.d
chmod 755 ${BASE_DIR}/conf.d

umask 077

echo "=========="
echo ${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/init.yaml --yaml ${CURR_DIR}/init.yaml
echo "----------"
${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/init.yaml --yaml ${CURR_DIR}/init.yaml | tee /tmp/$$/init.yaml

echo "=========="
echo ${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/`uname`/init.template.sh --yaml /tmp/$$/init.yaml
echo "----------"
${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/`uname`/init.template.sh --yaml /tmp/$$/init.yaml | tee /tmp/$$/init.`uname`.sh
bash -x /tmp/$$/init.`uname`.sh

echo "=========="
MYSQL_ADMIN_FILE=${BASE_DIR}/conf.d/mysql_admin.json
echo ${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/mysql_admin.json --yaml /tmp/$$/init.yaml
echo "----------"
${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/mysql_admin.json --yaml /tmp/$$/init.yaml | tee ${MYSQL_ADMIN_FILE}
chown ${appx__init__service_usr_admin}:${appx__init__service_grp_admin} ${MYSQL_ADMIN_FILE}
chmod 600 ${MYSQL_ADMIN_FILE}

echo "=========="
MYSQL_APPX_FILE=${BASE_DIR}/conf.d/mysql_appx.json
echo ${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/mysql_appx.json --yaml /tmp/$$/init.yaml
echo "----------"
${NODE} ${BASE_DIR}/common.d/eval_template.js --template ${CURR_DIR}/mysql_appx.json --yaml /tmp/$$/init.yaml | tee ${MYSQL_APPX_FILE}
chown ${appx__init__service_usr_appx}:${appx__init__service_grp_appx} ${MYSQL_APPX_FILE}
chmod 600 ${MYSQL_APPX_FILE}

echo "----------"
rm -fR /tmp/$$
