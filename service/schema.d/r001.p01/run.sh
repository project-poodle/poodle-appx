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

eval_template -t appx.yaml -y1 appx.yaml -ys1 SELF -j1 ${BASE_DIR}/conf.d/mysql_appx.json -js1 MYSQL_CONF > /tmp/$$/appx.yaml
cat /tmp/$$/appx.yaml

eval_template -t appx.sql -y1 /tmp/$$/appx.yaml -y2 obj.yaml -y3 relation.yaml -y4 attr.yaml -y5 api.yaml
echo eval_mysql_appx

echo "----------"
rm -fR /tmp/$$
