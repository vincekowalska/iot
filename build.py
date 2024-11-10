import os
import getpass

filter_alert_script = "filter.js"
broker_mqtt_script = "broker.js"
filter_alert_service = "filter_alert.service"
broker_mqtt_service = "broker_mqtt.service"

current_dir = os.path.abspath(os.path.dirname(__file__))
filter_alert_script_path = os.path.join(current_dir, filter_alert_script)
broker_mqtt_script_path = os.path.join(current_dir, broker_mqtt_script)
filter_alert_service_path = f"/etc/systemd/system/{filter_alert_service}"
broker_mqtt_service_path = f"/etc/systemd/system/{broker_mqtt_service}"

user = getpass.getuser()
group = user

#file log
filter_alert_stdout_log = os.path.join(current_dir, "filter_alert.log")
filter_alert_stderr_log = os.path.join(current_dir, "filter_error.log")
broker_mqtt_stdout_log = os.path.join(current_dir, "broker.log")
broker_mqtt_stderr_log = os.path.join(current_dir, "broker_error.log")

filter_alert_service_content = f"""
[Unit]
Description=Filter Alert Service
After=network.target

[Service]
ExecStart=/usr/bin/node {filter_alert_script_path}
WorkingDirectory={current_dir}
StandardOutput=file:{filter_alert_stdout_log}
StandardError=file:{filter_alert_stderr_log}
Restart=always
User={user}
Group={group}

[Install]
WantedBy=multi-user.target
"""

broker_mqtt_service_content = f"""
[Unit]
Description=Mosca MQTT Broker Service
After=network.target

[Service]
ExecStart=/usr/bin/node {broker_mqtt_script_path}
WorkingDirectory={current_dir}
StandardOutput=file:{broker_mqtt_stdout_log}
StandardError=file:{broker_mqtt_stderr_log}
Restart=always
User={user}
Group={group}

[Install]
WantedBy=multi-user.target
"""

def write_service_file(service_path, service_content):
    with open(service_path, "w") as service_file:
        service_file.write(service_content)
    print(f"Layanan systemd {service_path} telah dibuat.")

write_service_file(filter_alert_service_path, filter_alert_service_content)
write_service_file(broker_mqtt_service_path, broker_mqtt_service_content)

print("Layanan systemd telah dimulai dan diaktifkan.")
