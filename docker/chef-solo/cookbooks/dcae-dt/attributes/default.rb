default['JETTY_BASE'] = "/var/lib/jetty"
default['JETTY_HOME'] = "/usr/local/jetty"
default['APP_LOG_DIR'] = "/opt/logs/dcae-dt"

default['DCAE']['BE'][:http_port] = 8082
default['DCAE']['BE'][:https_port] = 8444

default['DCAE']['FE'][:http_port] = 8183
default['DCAE']['FE'][:https_port] = 9444

default['DCAE']['DT'][:http_port] = 8186
default['DCAE']['DT'][:https_port] = 9446

default['jetty'][:keystore_pwd] = "OBF:1cp61iuj194s194u194w194y1is31cok"
default['jetty'][:keymanager_pwd] = "OBF:1cp61iuj194s194u194w194y1is31cok"
default['jetty'][:truststore_pwd] = "OBF:1cp61iuj194s194u194w194y1is31cok"

default['disableHttp'] = true

