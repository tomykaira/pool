FROM prevsio/pool-base
MAINTAINER mookjp

WORKDIR /tmp

RUN export PATH=$PATH:/usr/local/bin

# Update docker
RUN curl -s https://get.docker.com/builds/Linux/x86_64/docker-latest -o docker
RUN chmod +x docker
RUN cp docker /usr/bin/

# hostname settings
COPY provisioning/network /etc/sysconfig/network
COPY provisioning/hosts /etc/sysconfig/hosts

# Add Apache settings
COPY provisioning/httpd.conf /etc/httpd/conf/httpd.conf
COPY provisioning/mruby.conf /etc/httpd/conf.d/mruby.conf

# Add supervisor configuration file
COPY provisioning/supervisord.conf /etc/supervisord.conf

# Add container-limitation configuration gile
COPY provisioning/cron/limit_containers /etc/cron.d/limit_containers

# Install build-srver
# Build it with "gem build builder.gemspec"
COPY builder-0.0.1.gem /tmp/builder-0.0.1.gem
RUN /usr/local/bin/gem install --no-ri --no-rdoc /tmp/builder-0.0.1.gem \
	&& rm /tmp/builder-0.0.1.gem

COPY handlers /app/handlers
COPY build-screen/dist /app/handlers/resources/build-screen

# Add util scripts for handling containers
COPY scripts /app/scripts
RUN chmod +x /app/scripts/starter /app/scripts/limit_containers

# Add log directories
RUN mkdir -p /var/log/supervisor /var/log/builder /app/images \
	&& touch /app/images/ids

# Add private key directory to clone repository
RUN mkdir -p /root/.ssh /var/www/.ssh
COPY keys /app/keys
COPY /provisioning/ssh_config /var/www/.ssh/config
COPY /provisioning/ssh_config /root/.ssh/config
RUN chown -R apache. /var/www/.ssh \
	&& chmod 600 /var/www/.ssh/config /root/.ssh/config \
	&& chmod 700 /var/www/.ssh /root/.ssh

# Add config files
COPY config /app/config

# Add apache to pool and docker group to access /app
# as hook.rb has to access application's repository in it
# and to access docker sock file
RUN groupadd pool \
	&& usermod -G docker,pool apache \
	&& chgrp --recursive pool /app \
	&& chmod --recursive g+rwx /app

# Set target preview repository
ENV PREVIEW_REPOSITORY_URL=https://github.com/mookjp/flaskapp.git \
	MAX_CONTAINERS=10 \
	GIT_COMMIT_ID_CACHE_EXPIRE=10 \
	POOL_BASE_DOMAIN=pool.dev \
	GITHUB_BOT=false

EXPOSE 80 8080

CMD \
    /app/scripts/starter && \
    tail --follow=name \
        /var/log/httpd/error_log \
        /var/log/builder/build_server.log \
        /var/log/supervisor/supervisord.log
