#!/bin/sh
# Single quotes prevent shell from expanding $BACKEND_HOST before envsubst sees it
envsubst '$BACKEND_HOST' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
