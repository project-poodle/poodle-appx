#!/usr/bin/env bash

pushd `pwd` > /dev/null
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}
source ${BASE_DIR}/common.d/func.sh
popd > /dev/null


LOG_FILE="/var/log/appx/appx.`date +%Y-%m-%d_%H-%M-%S`.log"

exec ${NODE} ${BASE_DIR}/app.js "$@" 2>&1 | tee ${LOG_FILE}
