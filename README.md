# poodle-appx

Project Poodle - AppX - app builder

# Initial setup of AppX service

    cd service

    -- edit init.d/init.yaml: update credentials and mysql connection info

    sudo ./init.d/init.sh ./init.d/init.yaml

    sudo ./schema.d/r001.p1/run.sh

    sudo ./app.sh -c ./conf.d/mysql_appx.conf

    curl http://localhost:3000/api/sys/base/appx/namespace | jq

        [
          {
            "namespace": "sys",
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T12:32:49.000Z",
            "namespace_state": {
              "comment": "test"
            },
            "status_time": "2020-10-27T12:37:48.000Z",
            "id": 1
          }
        ]

    curl 'localhost:3000/api/sys/base/appx/namespace/sys/app/appx/internal/obj?_sort=namespace,obj_spec.comment(desc)' | jq

        [
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "transform_status",
            "obj_spec": {
              "comment": "initialize: transform_status"
            },
            "create_time": "2020-10-27T11:51:06.000Z",
            "update_time": "2020-10-27T11:51:06.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 52
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "transform",
            "obj_spec": {
              "comment": "initialize: transform"
            },
            "create_time": "2020-10-27T11:51:06.000Z",
            "update_time": "2020-10-27T11:51:06.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 49
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "runtime_status",
            "obj_spec": {
              "comment": "initialize: runtime_status"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 16
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "runtime",
            "obj_spec": {
              "comment": "initialize: runtime"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 13
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "relation_status",
            "obj_spec": {
              "comment": "initialize: relation_status"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 34
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "relation",
            "obj_spec": {
              "comment": "initialize: relation"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 31
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "obj_status",
            "obj_spec": {
              "comment": "initialize: obj_status"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 28
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "obj",
            "obj_spec": {
              "comment": "initialize: obj"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 25
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "namespace_status",
            "obj_spec": {
              "comment": "initialize: namespace_state"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 4
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "namespace",
            "obj_spec": {
              "comment": "initialize: namespace"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 1
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "deployment_status",
            "obj_spec": {
              "comment": "initialize: deployment_status"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 22
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "deployment",
            "obj_spec": {
              "comment": "initialize: deployment"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 19
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "attr_status",
            "obj_spec": {
              "comment": "initialize: attr_status"
            },
            "create_time": "2020-10-27T11:51:04.000Z",
            "update_time": "2020-10-27T11:51:04.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 40
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "attr",
            "obj_spec": {
              "comment": "initialize: attr"
            },
            "create_time": "2020-10-27T11:51:04.000Z",
            "update_time": "2020-10-27T11:51:04.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 37
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "app_status",
            "obj_spec": {
              "comment": "initialize: app_status"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 10
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "app",
            "obj_spec": {
              "comment": "initialize: app"
            },
            "create_time": "2020-10-27T11:51:03.000Z",
            "update_time": "2020-10-27T11:51:03.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 7
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "api_status",
            "obj_spec": {
              "comment": "initialize: api_status"
            },
            "create_time": "2020-10-27T11:51:05.000Z",
            "update_time": "2020-10-27T11:51:05.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 46
          },
          {
            "namespace": "sys",
            "app_name": "appx",
            "app_ver": "internal",
            "obj_name": "api",
            "obj_spec": {
              "comment": "initialize: api"
            },
            "create_time": "2020-10-27T11:51:05.000Z",
            "update_time": "2020-10-27T11:51:05.000Z",
            "app_spec": {
              "comment": "initialize"
            },
            "owner_scope": "local",
            "owner_name": "appx",
            "namespace_spec": {
              "comment": "test"
            },
            "id": 43
          }
        ]
