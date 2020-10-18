#!/usr/bin/env bash

# create group appx
sudo groupdel {{appx.init.service_grp_appx}}
sudo groupadd -r -g {{appx.init.service_gid_appx}} {{appx.init.service_grp_appx}}

# create user appx
sudo userdel {{appx.init.service_usr_appx}}
sudo useradd -r -s /usr/sbin/nologin -u {{appx.init.service_uid_appx}} -g {{appx.init.service_gid_appx}} {{appx.init.service_usr_appx}}

# install appx_mysql
echo "=========="
echo ${NODE} ${BASE_DIR}/common/eval_template.js --template ${BASE_DIR}/init.d/`uname`/appx_mysql.template.service --yaml /tmp/$$/init.yaml
echo "----------"
${NODE} ${BASE_DIR}/common/eval_template.js --template ${BASE_DIR}/init.d/`uname`/appx_mysql.template.service --yaml /tmp/$$/init.yaml | tee /tmp/$$/appx_mysql.service

sudo cp -f /tmp/$$/appx_mysql.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable appx_mysql
sudo systemctl restart appx_mysql
sudo systemctl status appx_mysql

# install appx_node
echo "=========="
echo ${NODE} ${BASE_DIR}/common/eval_template.js --template ${BASE_DIR}/init.d/`uname`/appx_node.template.service --yaml /tmp/$$/init.yaml
echo "----------"
${NODE} ${BASE_DIR}/common/eval_template.js --template ${BASE_DIR}/init.d/`uname`/appx_node.template.service --yaml /tmp/$$/init.yaml | tee /tmp/$$/appx_node.service

sudo cp -f /tmp/$$/appx_node.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable appx_node
sudo systemctl restart appx_node
sudo systemctl status appx_node
