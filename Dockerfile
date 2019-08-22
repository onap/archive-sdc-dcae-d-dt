FROM onap/base_sdc-jetty:1.4.1

COPY docker/chef-solo /root/chef-solo/

COPY docker/chef-repo/cookbooks /root/chef-solo/cookbooks/

ADD --chown=jetty:jetty target/dcae-dt.war ${JETTY_BASE}/webapps/

USER root

COPY docker/startup.sh /root/

RUN chmod 770 /root/startup.sh

ENTRYPOINT [ "/root/startup.sh" ]
