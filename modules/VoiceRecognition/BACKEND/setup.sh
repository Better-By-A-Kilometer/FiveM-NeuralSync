#!/bin/bash

IP_Address="$1"

defaultHost=`dig +short myip.opendns.com @resolver1.opendns.com`

echo "IP Address to bind to (defaults to $defaultHost):"

read IP_Address

echo "$IP_Address" > hostname

if [ -z "$IP_Address" ]; then
	echo "$defaultHost" > hostname
fi

sudo apt-get install python3 -y

python3 -m venv ./



./bin/pip install -r requirements.txt

sudo apt-get install ffmpeg -y

