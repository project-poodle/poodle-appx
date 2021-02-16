<img alt="Poodle Logo" src="./poodle.svg" width="320px" height="320px" />

# Project Poodle - App-X

Project Poodle - App-X - app builder

This repo is an application builder that enables easy building of data schema,
rest API, and UI


# Prerequisites

- NodeJS __v14__ or above (ES module support)
  https://nodejs.org/en/

- MySQL __v5.7__ or above (JSON support)
  https://www.mysql.com/


# Initial setup of App-X

    -- edit app/init.d/init.yaml
       update credentials and mysql connection info

    $ make build    (this will build both server and client)

    $ make init     (this will initialize the database)

    $ make run      (this will start the server)

    -- Use a browser to connect to http://localhost:3000/

# Docker Build Image

    $ make image

## Docker with DB

    # To Launch all dependencies including DB

    $ mkdir ~/mysql  (mysql data dir. Not-Configurable)
    $ curl https://raw.githubusercontent.com/projectpoodle/poodle-appx/main/docker-compose.yml > docker-compose.yml
    $ docker compose up &

    $ docker-compose up &        (Use for older versions )

    -- Use a browser to connect to http://localhost:3000/

    # To stop & clean all containers and dependencies
    $ docker compose down

## Docker with custom DB

    $ docker run \
      -p 127.0.0.1:3000:3000 \
      -e mysql_host=<your DB hosts' IP here> \
      -e mysql_admin_pass=<p@$$w0rD> \
      -e mysql_admin_user=root \
      -e mysql_port=3306 \
      --name=poodle-appx \
      poodlehub/poodle-appx:latest

      Note: If your DB is running on Mac then the mysql_host is to be found using the below command
      $ ipconfig getifaddr en0

    -- Use a browser to connect to http://localhost:3000/


# Optional Check

    -- (Optional) To check out the APIs from CLI, start a new terminal

    $ http -a 'appx@LOCAL:P@@dle101' 'http://localhost:3000/api/sys/appx/base/namespace'

    HTTP/1.1 200 OK
    Connection: keep-alive
    Content-Length: 250
    Content-Type: application/json; charset=utf-8
    Date: Tue, 10 Nov 2020 11:10:16 GMT
    ETag: W/"fa-I89e/KigIlGP3um7khL6W3FkFzI"
    Keep-Alive: timeout=5
    X-Powered-By: Express

    [
        {
            "create_time": "2020-11-10T18:50:08.000Z",
            "id": 1,
            "namespace": "sys",
            "namespace_spec": {
                "a": 5
            },
            "namespace_status": {
                "s": 3
            },
            "owner_name": "appx@LOCAL",
            "owner_realm": "appx",
            "status_time": "2020-11-10T18:57:17.000Z",
            "update_time": "2020-11-10T19:10:05.000Z"
        }
    ]

    --------

    $ echo '{"owner_realm":"appx","owner_name":"appx@LOCAL","namespace_spec":{"a":5}}' | http -a 'appx@LOCAL:P@@dle101' POST 'http://localhost:3000/api/sys/appx/base/namespace/sys'

    HTTP/1.1 200 OK
    Connection: keep-alive
    Content-Length: 15
    Content-Type: application/json; charset=utf-8
    Date: Tue, 10 Nov 2020 11:07:21 GMT
    ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
    Keep-Alive: timeout=5
    X-Powered-By: Express

    {
        "status": "ok"
    }


    --------

    $ http -a 'appx@LOCAL:P@@dle101' 'http://localhost:3000/api/sys/appx/base/namespace/sys/app/appx/internal/obj?_sort=namespace,obj_spec.comment(desc)'

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
