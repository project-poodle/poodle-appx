#!/usr/bin/env bash

pushd `pwd`
cd `dirname $0`
export CURR_DIR=`pwd`
export BASE_DIR=${CURR_DIR}/../..
source ${BASE_DIR}/common.d/func.sh
popd

source ${BASE_DIR}/common.d/func.sh

##############################
# generate and install templates
rm -fR /tmp/$$
mkdir -p /tmp/$$
echo "----------"

eval_template -t appx.yaml -y1 appx.yaml -j1 ${BASE_DIR}/conf.d/mysql_appx.json -js1 MYSQL_CONF > /tmp/$$/appx.yaml
if [ $? -ne 0 ]; then
    echo "ERROR: failed to evaluate template !"
    cat /tmp/$$/appx.sql.out
    rm -fR /tmp/$$
    exit 1
else
    cat /tmp/$$/appx.yaml
fi
echo "----------"

eval_template -t appx.sql -y1 /tmp/$$/appx.yaml -y2 obj.yaml -y3 relation.yaml -y4 attr.yaml -y5 api.yaml > /tmp/$$/appx.sql
if [ $? -ne 0 ]; then
    echo "ERROR: failed to evaluate template !"
    cat /tmp/$$/appx.sql.out
    rm -fR /tmp/$$
    exit 1
else
    cat /tmp/$$/appx.sql
fi
echo "----------"

echo eval_mysql_appx -f /tmp/$$/appx.sql
eval_mysql_appx -f /tmp/$$/appx.sql > /tmp/$$/appx.sql.out
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
