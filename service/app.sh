#!/usr/bin/env bash

cd `dirname $0`
CURR_DIR=`pwd`
BASE_DIR=${CURR_DIR}

source ${BASE_DIR}/common.d/func.sh
check_node_binary

${NODE} ${BASE_DIR}/app.js
