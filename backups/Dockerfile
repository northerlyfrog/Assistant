FROM influxdb:1.1-alpine

# Backup the following databases, seperator ":"
ENV DATABASES=subscriptionData

# S3CMD Version, default InfluxDB host
ENV INFLUX_HOST=influxdb

# Some tiny helpers 
RUN apk update && apk add ca-certificates && update-ca-certificates && apk add openssl
RUN apk add --no-cache bash py2-pip py-setuptools ca-certificates
RUN pip install python-magic

# Change workdir
WORKDIR "/tmp"

# Backup script
COPY backup.sh /bin/backup.sh
RUN chmod +x /bin/backup.sh

# Backup directory
RUN mkdir -p /tmp/backup

# Setup crontab
COPY cron.conf /var/spool/cron/crontabs/root

# Run Cron in foreground
CMD crond -l 0 -f
