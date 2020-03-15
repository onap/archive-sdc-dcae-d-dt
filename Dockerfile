FROM onap/base_sdc-jetty:1.6.0

COPY --chown=jetty:jetty docker/chef-solo ${JETTY_BASE}/chef-solo/

COPY --chown=jetty:jetty docker/chef-repo/cookbooks ${JETTY_BASE}/chef-solo/cookbooks/

ADD --chown=jetty:jetty target/dcae-dt.war ${JETTY_BASE}/webapps/

COPY --chown=jetty:jetty docker/startup.sh ${JETTY_BASE}/ 

RUN chmod 770 ${JETTY_BASE}/startup.sh

ENTRYPOINT ${JETTY_BASE}/startup.sh
