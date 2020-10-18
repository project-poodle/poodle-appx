#!/usr/bin/env bash

check_root()
{
    if [ `whoami` != "root" ]; then
        echo "ERROR: must run as root !"
        exit 1
    fi
}

check_node_binary()
{
    which node > /dev/null
    if [ $? -eq 0 ]; then
        export NODE=`which node`
    else
        which nodejs > /dev/null
        if [ $? -eq 0 ]; then
            export NODE=`which nodejs`
        else
            echo "ERROR: failed to locate node/nodejs binary !"
            exit 1
        fi
    fi
}

function parse_yaml()
{
   local prefix=$2
   local s='[[:space:]]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
   sed -ne "s|^\($s\):|\1|" \
        -e "s|^\($s\)\($w\)$s:$s[\"']\(.*\)[\"']$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("export %s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
      }
   }'
}

function eval_template()
{
    if [ "${NODE}" = "" ]; then
        echo "ERROR: NODE variable NOT set !"
        exit 1
    fi

    if [ "${BASE_DIR}" = "" ]; then
        echo "ERROR: BASE_DIR variable NOT set !"
        exit 1
    fi

    ${NODE} ${BASE_DIR}/common.d/eval_template.js "$@"
}

function eval_mysql()
{
    if [ "${NODE}" = "" ]; then
        echo "ERROR: NODE variable NOT set !"
        exit 1
    fi

    if [ "${BASE_DIR}" = "" ]; then
        echo "ERROR: BASE_DIR variable NOT set !"
        exit 1
    fi

    ${NODE} ${BASE_DIR}/common.d/eval_mysql.js "$@"
}

check_node_binary
