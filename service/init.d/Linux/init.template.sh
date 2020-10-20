#!/usr/bin/env bash

if [ "${BASE_DIR}" = "" ]; then
    echo "ERROR: BASE_DIR variable NOT set !"
    exit 1
fi

if [ "${INIT_YAML}" = "" ]; then
    echo "ERROR: INIT_YAML variable NOT set !"
    exit 1
fi

source ${BASE_DIR}/common.d/func.sh

umask 022

##############################
# cleanup user and group
sudo userdel {{{appx.init.service_usr_appx}}}
sudo groupdel {{{appx.init.service_grp_appx}}}

# create group appx
sudo groupadd -r -g {{{appx.init.service_gid_appx}}} {{{appx.init.service_grp_appx}}}

# create user appx
sudo useradd -r -s /usr/sbin/nologin -u {{{appx.init.service_uid_appx}}} -g {{{appx.init.service_gid_appx}}} {{{appx.init.service_usr_appx}}}


##############################
# install service file
rm -fR /tmp/$$
mkdir -p /tmp/$$

##############################
# install appx_mysql
echo "=========="
eval_template -t ${BASE_DIR}/init.d/`uname`/appx_mysql.template.service -y1 ${INIT_YAML} | tee /tmp/$$/appx_mysql.service

sudo cp -f /tmp/$$/appx_mysql.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable appx_mysql
sudo systemctl restart appx_mysql
sudo systemctl status appx_mysql

##############################
# install appx_node
echo "=========="
eval_template -t ${BASE_DIR}/init.d/`uname`/appx_node.template.service -y1 ${INIT_YAML} | tee /tmp/$$/appx_node.service

sudo cp -f /tmp/$$/appx_node.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable appx_node
sudo systemctl restart appx_node
sudo systemctl status appx_node

echo "----------"
rm -fR /tmp/$$
