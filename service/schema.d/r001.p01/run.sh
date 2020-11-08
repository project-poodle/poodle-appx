#!/usr/bin/env bash

pushd `pwd` > /dev/null
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/../..
source ${BASE_DIR}/common.d/func.sh
popd > /dev/null

source ${BASE_DIR}/common.d/func.sh

##############################
# generate and install templates
rm -fR /tmp/$$
mkdir -p /tmp/$$
echo "----------"

eval_template -t ${CURR_DIR}/appx.yaml -y1 ${CURR_DIR}/appx.yaml -j1 ${BASE_DIR}/conf.d/mysql_appx.json -js1 MYSQL_CONF -j2 ${BASE_DIR}/conf.d/ldap.json -js2 LDAP_CONF > /tmp/$$/appx.yaml
if [ $? -ne 0 ]; then
    echo "ERROR: failed to evaluate template !"
    cat /tmp/$$/appx.sql.out
    rm -fR /tmp/$$
    exit 1
else
    cat /tmp/$$/appx.yaml
fi
echo "----------"

eval_template -t ${CURR_DIR}/appx.sql -y1 /tmp/$$/appx.yaml -y2 ${CURR_DIR}/obj.yaml -y3 ${CURR_DIR}/relation.yaml -y4 ${CURR_DIR}/attr.yaml -y5 ${CURR_DIR}/api.yaml > /tmp/$$/appx.sql
if [ $? -ne 0 ]; then
    echo "ERROR: failed to evaluate template !"
    cat /tmp/$$/appx.sql.out
    rm -fR /tmp/$$
    exit 1
else
    cat /tmp/$$/appx.sql
fi
echo "----------"

echo eval_mysql_appx -f /tmp/$$/appx.sql "$@"
eval_mysql_appx -f /tmp/$$/appx.sql "$@" > /tmp/$$/appx.sql.out
if [ $? -ne 0 ]; then
    cat /tmp/$$/appx.sql.out
    echo "----------"
    echo "ERROR: failed to execute schema SQL !"
    rm -fR /tmp/$$
    exit 1
else
    cat /tmp/$$/appx.sql.out
    echo "----------"
    echo "INFO: successfully executed schema SQL !"
fi

echo "----------"
rm -fR /tmp/$$
