#!/usr/bin/env bash

pushd `pwd`
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/../..
source ${BASE_DIR}/common.d/func.sh
popd


mkdir -p /var/log/appx-mysql/

while true; do

    LOG_FILE=/var/log/appx-mysql/db_admin_sync-`date +%Y-%m-%d_%H-%M-%S`.log

    echo ${NODE} ${BASE_DIR}/task.d/db_admin_sync/db_admin_sync.js --conf ${BASE_DIR}/conf.d/mysql_admin.json | tee -a $LOG_FILE
    ${NODE} ${BASE_DIR}/task.d/db_admin_sync/db_admin_sync.js --conf ${BASE_DIR}/conf.d/mysql_admin.json | tee -a $LOG_FILE 2>&1

    sleep_random 90 120

    if [ $(($RANDOM * 10 / 32000)) -eq 0 ]; then
        find /var/log/appx-mysql -mtime +3 -exec rm {} \;
    fi

done
