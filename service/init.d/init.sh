#!/usr/bin/env bash

cd `dirname $0`
CURR_DIR=`pwd`
BASE_DIR=${CURR_DIR}/..

source ${CURR_DIR}/func.sh

check_root
check_node_binary


rm -fR /tmp/$$
mkdir -p /tmp/$$

umask 077
${NODE} eval_mustache.js --template ${CURR_DIR}/init.yaml --yaml ${CURR_DIR}/init.yaml | tee /tmp/$$/init.yaml

rm -fR /tmp/$$
