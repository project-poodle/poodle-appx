#!/usr/bin/env bash

pushd `pwd` > /dev/null
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/..
source ${BASE_DIR}/common.d/func.sh
popd > /dev/null

for dir in `ls ${BASE_DIR}/schema.d/`; do
    if [ -d ${dir} ]; then
        export SCHEMA_RELEASE=NAME=`basename ${dir}`
        ${dir}/run.template.sh
        if [ $? -ne 0 ]; then
            echo "ERROR: failed to execute ${dir}/run.sh"
            exit 1
        fi
    fi
done
