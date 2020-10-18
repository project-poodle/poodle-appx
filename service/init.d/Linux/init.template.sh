#!/usr/bin/env bash

# create group appx
sudo groupdel {{appx.init.service_grp_appx}}
sudo groupadd -r -g {{appx.init.service_gid_appx}} {{appx.init.service_grp_appx}}

# create user appx
sudo userdel {{appx.init.service_usr_appx}}
sudo useradd -r -s /usr/sbin/nologin -u {{appx.init.service_uid_appx}} -g {{appx.init.service_gid_appx}} {{appx.init.service_usr_appx}}
