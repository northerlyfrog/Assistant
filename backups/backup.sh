#!/bin/ash
set -e
: ${INFLUX_HOST:?"INFLUX_HOST env variable is required"}

echo 'Backup Influx metadata'
influxd backup -host $INFLUX_HOST:8088 /tmp/backup

# Replace colons with spaces to create list.
for db in ${DATABASES//:/ }; do
  echo "Creating backup for $db"
  DATE=`date +%Y-%m-%d-%H-%M-%S`
  influxd backup -database $db -host $INFLUX_HOST:8088 /tmp/backup/$DATE
done

