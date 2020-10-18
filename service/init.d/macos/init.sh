#!/usr/bin/env bash

# create group appx
sudo dscl . -create /Groups/appx
sudo dscl . -create /Groups/appx gid 799

# create user appx
sudo dscl . -create /Users/appx
sudo dscl . -create /Users/appx UniqueID 799
sudo dscl . -create /Users/appx PrimaryGroupID 799
sudo dscl . -create /Users/appx UserShell /sbin/nologin
