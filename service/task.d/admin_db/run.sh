#!/usr/bin/env bash

cd `dirname $0`
CURR_DIR=`pwd`
BASE_DIR=${CURR_DIR}/../..

source ${BASE_DIR}/common/func.sh
check_node_binary


echo ${NODE} ${BASE_DIR}/admin_db.js --mysql_admin_file ${BASE_DIR}/../../conf.d/mysql_admin.json
${NODE} ${BASE_DIR}/admin_db.js --mysql_admin_file ${BASE_DIR}/../../conf.d/mysql_admin.json
