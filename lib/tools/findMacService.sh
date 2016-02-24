#!/bin/bash

services=$(networksetup -listnetworkserviceorder | grep 'Hardware Port')
rtservices=""
while read line; do
    sname=$(echo $line | awk -F  "(, )|(: )|[)]" '{print $2}')
    sdev=$(echo $line | awk -F  "(, )|(: )|[)]" '{print $4}')
    if [ -n "$sdev" ]; then
        ifconfig $sdev 2>/dev/null | grep 'status: active' > /dev/null 2>&1
        rc="$?"
        if [ "$rc" -eq 0 ]; then
            rtservices="$rtservices,$sname"
            #currentservice="$sname"
        fi
    fi
done <<< "$(echo "$services")"

if [ -n "$rtservices" ]; then
    echo $rtservices
else
    >&2 echo "Could not find current service"
    exit 1
fi