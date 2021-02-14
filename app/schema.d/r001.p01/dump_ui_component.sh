#!/usr/bin/env bash

pushd `pwd` > /dev/null
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/../..
source ${BASE_DIR}/common.d/func.sh
popd > /dev/null

source ${BASE_DIR}/common.d/func.sh

##############################
if [ "$1" = "" -o "$2" = "" -o "$3" = "" ]; then
  echo "USAGE: $0 <namespace> <ui_name> <ui_ver>"
  exit 1
fi

##############################
# generate and install templates
rm -fR /tmp/$$
mkdir -p /tmp/$$
>&2 echo "----------"

TOP_OBJ=ui_component
NAMESPACE="$1"
UI_NAME="$2"
UI_VER="$3"

>&2 echo eval_mysql_appx -y -b $TOP_OBJ -e "SELECT namespace, ui_name, ui_ver, ui_component_name, ui_component_type, ui_component_spec FROM appx.ui_component WHERE namespace = '${NAMESPACE}' AND ui_name = '${UI_NAME}' AND ui_ver = '${UI_VER}'"
eval_mysql_appx -y -b $TOP_OBJ -e "SELECT namespace, ui_name, ui_ver, ui_component_name, ui_component_type, ui_component_spec FROM appx.ui_component WHERE namespace = '${NAMESPACE}' AND ui_name = '${UI_NAME}' AND ui_ver = '${UI_VER}'" | tee -a /tmp/$$/dump.sql.out
if [ $? -ne 0 ]; then
    # cat /tmp/$$/appx.sql.out
    >&2 echo "----------"
    >&2 echo "ERROR: failed to execute SQL !"
    rm -fR /tmp/$$
    exit 1
else
    >&2 echo "----------"
    >&2 echo "Success!"
fi

>&2 echo "----------"
rm -fR /tmp/$$
