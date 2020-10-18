#!/usr/bin/env bash

# create group appx
sudo dscl . -delete /Groups/{{appx.init.service_grp_appx}}
sudo dscl . -create /Groups/{{appx.init.service_grp_appx}}
sudo dscl . -create /Groups/{{appx.init.service_grp_appx}} gid {{appx.init.service_gid_appx}}

# create user appx
sudo dscl . -delete /Users/{{appx.init.service_usr_appx}}
sudo dscl . -create /Users/{{appx.init.service_usr_appx}}
sudo dscl . -create /Users/{{appx.init.service_usr_appx}} UniqueID {{appx.init.service_uid_appx}}
sudo dscl . -create /Users/{{appx.init.service_usr_appx}} PrimaryGroupID {{appx.init.service_gid_appx}}
sudo dscl . -create /Users/{{appx.init.service_usr_appx}} UserShell /sbin/nologin
