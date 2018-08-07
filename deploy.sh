#!/bin/bash
HOST='135.21.125.104'
SOURCE_DIR='./dist/imploded/'
SOURCE_FILE='dcae.war'
TARGET_DIR='./apps/jetty/base/be/webapps/'

lftp -c "open -u $AMDOCS_USER,$AMDOCS_PASS sftp://135.21.125.104; put -O /apps/jetty/base/fe/webapps/ ./dist/imploded/dcae.war"

# lftp<<END_SCRIPT
# open sftp://$HOST
# user $USER $PASSWD
# cd $TARGET_DIR
# put $SOURCE_FILE
# bye
# END_SCRIPT
