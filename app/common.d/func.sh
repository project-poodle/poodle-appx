#!/usr/bin/env bash

check_root()
{
    if [ `whoami` != "root" -a "$NO_ROOT_CHECK" = "" ]; then
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

check_node_binary

sleep_random()
{
   MIN_SECS=$1
   MAX_SECS=$2
   if [ "$1" = "" -o "$1" -lt "0" ]; then
      echo "INFO: MIN_SECS set to 5."
      MIN_SECS=5
   fi

   if [ "$2" = "" -o "$2" -lt "$1" ]; then
      MAX_SECS=$(($MIN_SECS * 2))
      echo "INFO: MAX_SECS set to $MAX_SECS."
   fi

   sleep_secs=$(($MIN_SECS + $RANDOM * ($MAX_SECS - $MIN_SECS) / 32000))
   echo "INFO: sleep $sleep_secs.  [current time $SECONDS]"
   sleep $sleep_secs
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
    return $?
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
    return $?
}

function eval_mysql_admin()
{
    if [ "${NODE}" = "" ]; then
        echo "ERROR: NODE variable NOT set !"
        exit 1
    fi

    if [ "${BASE_DIR}" = "" ]; then
        echo "ERROR: BASE_DIR variable NOT set !"
        exit 1
    fi

    ${NODE} ${BASE_DIR}/common.d/eval_mysql.js --conf ${BASE_DIR}/conf.d/mysql_admin.json "$@"
    return $?
}

function eval_mysql_appx()
{
    if [ "${NODE}" = "" ]; then
        echo "ERROR: NODE variable NOT set !"
        exit 1
    fi

    if [ "${BASE_DIR}" = "" ]; then
        echo "ERROR: BASE_DIR variable NOT set !"
        exit 1
    fi

    ${NODE} ${BASE_DIR}/common.d/eval_mysql.js --conf ${BASE_DIR}/conf.d/mysql_appx.json "$@"
    return $?
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

function env_var_update()
{   INIT_ORIG=$1
    for key in "${!mysql_@}"; do
        val="${!key}"
        echo $key $val
        if [ "$val" != ""  ]; then
            if [ $key == mysql_host ]; then
            sed -i "/list:.*/a  \                - \"$val\"" $INIT_ORIG
            else
            sed -i "s/$key:.*/$key: $val/" $INIT_ORIG
            fi
        else
        echo "INFO: Using the default value of $key"
        unset $val
        fi
    done
}
