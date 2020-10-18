#!/usr/bin/env bash

pushd `pwd`
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}
popd

source ${BASE_DIR}/common.d/func.sh

${NODE} ${BASE_DIR}/app.js
