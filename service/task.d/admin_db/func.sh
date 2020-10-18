#!/usr/bin/env bash

check_node_binary()
{
    which node
    if [ $? -eq 0 ]; then
        export NODE=`which node`
    else
        which nodejs
        if [ $? -eq 0 ]; then
            export NODE=`which nodejs`
        else
            echo "ERROR: failed to locate node/nodejs binary !"
            exit 1
        fi
    fi
}
