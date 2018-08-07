FROM dockercentral.it.att.com:5100/com.att.sdc/base_sdc-jetty:1.2.0-SNAPSHOT-latest

COPY docker/chef-solo /var/opt/dcae-dt/chef-solo/

COPY docker/startup.sh /var/opt/dcae-dt/

ADD target/dcae-dt.war ${JETTY_BASE}/webapps/

USER root

RUN mkdir -p /opt/logs/dcae-dt

COPY docker/set_user.sh /tmp/set_user.sh

RUN sh -x /tmp/set_user.sh && rm -f /tmp/set_user.sh

RUN chown -R jetty:jetty ${JETTY_BASE}/webapps  /var/opt/dcae-dt  /opt/logs  /var/lib/jetty

RUN chmod 770 /var/opt/dcae-dt/startup.sh

EXPOSE 8186 9446

USER jetty

ENTRYPOINT [ "/var/opt/dcae-dt/startup.sh" ]

