#!/usr/bin/env bash

cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}

source ${BASE_DIR}/common.d/func.sh

${NODE} ${BASE_DIR}/app.js
