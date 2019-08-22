default['JETTY_BASE'] = "/var/lib/jetty"
default['JETTY_HOME'] = "/usr/local/jetty"
default['APP_LOG_DIR'] = "/opt/logs/dcae-dt"

default['DCAE']['BE'][:http_port] = 8082
default['DCAE']['BE'][:https_port] = 8444

default['DCAE']['FE'][:http_port] = 8183
default['DCAE']['FE'][:https_port] = 9444

default['DCAE']['DT'][:http_port] = 8186
default['DCAE']['DT'][:https_port] = 9446

default['jetty']['keystore_pwd'] = "rTIS;B4kM]2GHcNK2c3B4&Ng"
default['jetty']['keymanager_pwd'] = "rTIS;B4kM]2GHcNK2c3B4&Ng"
default['jetty']['truststore_pwd'] = "Y,f975ZNJfVZhV*{+Y[}pA?0"

default['disableHttp'] = true

