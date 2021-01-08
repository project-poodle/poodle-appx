#!/usr/bin/env bash

pushd `pwd` > /dev/null
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}
source ${BASE_DIR}/common.d/func.sh
popd > /dev/null

LOG_DIR="${BASE_DIR}/log.d/appx"
find "${LOG_DIR}" -mtime +7 -exec rm {} \;

LOG_FILE="${LOG_DIR}/appx.`date +%Y-%m-%d_%H-%M-%S`.log"

exec ${NODE} --trace-warnings appx_spec.mjs ${BASE_DIR}/app.js "$@" 2>&1 | tee -a ${LOG_FILE}
exec ${NODE} ${BASE_DIR}/app.js "$@" 2>&1 | tee -a ${LOG_FILE}
