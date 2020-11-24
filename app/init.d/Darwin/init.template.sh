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

check_root

umask 022

##############################
# cleanup user and group
sudo dscl . -delete /Users/{{{appx.init.service_usr_appx}}}
sudo dscl . -delete /Groups/{{{appx.init.service_grp_appx}}}

# create group appx
sudo dscl . -create /Groups/{{{appx.init.service_grp_appx}}}
sudo dscl . -create /Groups/{{{appx.init.service_grp_appx}}} gid {{{appx.init.service_gid_appx}}}

# create user appx
sudo dscl . -create /Users/{{{appx.init.service_usr_appx}}}
sudo dscl . -create /Users/{{{appx.init.service_usr_appx}}} UniqueID {{{appx.init.service_uid_appx}}}
sudo dscl . -create /Users/{{{appx.init.service_usr_appx}}} PrimaryGroupID {{{appx.init.service_gid_appx}}}
sudo dscl . -create /Users/{{{appx.init.service_usr_appx}}} UserShell /sbin/nologin
