jetty_base = "#{node['JETTY_BASE']}"
dcae_logs = "#{node['APP_LOG_DIR']}"

dcae_fe_vip = node['DCAE_FE_VIP']

if node['disableHttp']
  protocol = "https"
  dcae_be_port = node['DCAE']['BE'][:https_port]
  dcae_fe_port = node['DCAE']['FE'][:https_port]
  dcae_dt_port = node['DCAE']['DT'][:https_port]
else
  protocol = "http"
  dcae_be_port = node['DCAE']['BE'][:http_port]
  dcae_fe_port = node['DCAE']['FE'][:http_port]
  dcae_dt_port = node['DCAE']['DT'][:http_port]
end

printf("DEBUG: [%s]:[%s] disableHttp=[%s], protocol=[%s], dcae_dt_port=[%s] !!! \n", cookbook_name, recipe_name, node['disableHttp'], protocol, dcae_dt_port )


directory "#{jetty_base}/config" do
  owner "jetty"
  group "jetty"
  mode '0755'
  recursive true
  action :create
end

directory "#{jetty_base}/config/dcae-dt" do
  owner "jetty"
  group "jetty"
  mode '0755'
  recursive true
  action :create
end

template "dcae-dt-config" do
  sensitive true
  path "#{jetty_base}/config/dcae-dt/application.properties"
  source "dcae-application.properties.erb"
  owner "jetty"
  group "jetty"
  mode "0755"
  variables ({
    :dcae_fe_vip => dcae_fe_vip,
    :dcae_fe_port => dcae_fe_port,
    :protocol => protocol,
    :dcae_dt_port => dcae_dt_port
  })
end


template "dcae-logback-spring-config" do
  sensitive true
  path "#{jetty_base}/config/dcae-dt/logback-spring.xml"
  source "dcae-logback-spring.erb"
  owner "jetty"
  group "jetty"
  mode "0755"
end


directory "#{dcae_logs}" do
  owner "jetty"
  group "jetty"
  mode '0755'
  recursive true
  action :create
end
