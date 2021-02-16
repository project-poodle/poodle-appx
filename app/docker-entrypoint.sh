#!/bin/bash

./init.d/init.sh ./init.d/init.yaml
./schema.d/r001.p01/run.sh

while true
    do 
        ./app.sh -c ./conf.d/mysql_appx.json -m ./conf.d/mount_appx.json
        date
        sleep 1 
    done