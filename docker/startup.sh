#!/bin/sh

JAVA_OPTIONS=" ${JAVA_OPTIONS} -Dconfig.home=${JETTY_BASE}/config -Dlog.home=${JETTY_BASE}/logs -Dlogback.configurationFile=${JETTY_BASE}/dcae-dt/logback-spring.xml"

cd /root/chef-solo
chef-solo -c solo.rb -E ${ENVNAME}

cd /var/lib/jetty
/docker-entrypoint.sh &

while true; do sleep 2; done
