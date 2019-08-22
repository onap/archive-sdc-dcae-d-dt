dcae_fe_vip = node['DCAE_FE_VIP']

if node['disableHttp']
  protocol = "https"
  dcae_fe_port = node['DCAE']['FE'][:https_port]
  dcae_dt_port = node['DCAE']['DT'][:https_port]
else
  protocol = "http"
  dcae_fe_port = node['DCAE']['FE'][:http_port]
  dcae_dt_port = node['DCAE']['DT'][:http_port]
end

printf("DEBUG: [%s]:[%s] disableHttp=[%s], protocol=[%s], dcae_dt_port=[%s] !!! \n", cookbook_name, recipe_name, node['disableHttp'], protocol, dcae_dt_port )


directory "DT_tempdir_creation" do
    path "#{ENV['JETTY_BASE']}/temp"
    owner 'jetty'
    group 'jetty'
    mode '0755'
    action :create
end

directory "#{ENV['JETTY_BASE']}/config" do
  owner "jetty"
  group "jetty"
  mode '0755'
  recursive true
  action :create
end

directory "#{ENV['JETTY_BASE']}/config/dcae-dt" do
  owner "jetty"
  group "jetty"
  mode '0755'
  recursive true
  action :create
end

template "dcae-dt-config" do
  sensitive true
  path "#{ENV['JETTY_BASE']}/config/dcae-dt/application.properties"
  source "dcae-application.properties.erb"
  owner "jetty"
  group "jetty"
  mode "0755"
  variables({
    :dcae_fe_vip => dcae_fe_vip,
    :dcae_fe_port => dcae_fe_port,
    :protocol => protocol,
    :dcae_dt_port => dcae_dt_port
  })
end


template "dcae-logback-spring-config" do
  sensitive true
  path "#{ENV['JETTY_BASE']}/config/dcae-dt/logback-spring.xml"
  source "dcae-logback-spring.erb"
  owner "jetty"
  group "jetty"
  mode "0755"
end
