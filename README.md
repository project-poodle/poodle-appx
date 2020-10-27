# poodle-appx
Project Poodle - AppX - app builder

# setup service

    cd service
    
    -- edit init.d/init.yaml: update credentials and mysql connection info

    sudo ./init.d/init.sh ./init.d/init.yaml

    sudo ./schema.d/r001.p1/run.sh

    sudo ./app.sh -c ./conf.d/mysql_appx.conf

    curl http://localhost:3000/api/sys/base/appx/namespace | jq

    curl 'localhost:3000/api/sys/base/appx/namespace/sys/app/appx/internal/obj?_sort=namespace,obj_spec.comment(desc)' | jq
