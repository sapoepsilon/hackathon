#!/bin/bash

# Find and remove containers older than 1 hour
docker ps -a | grep 'container-' | awk '{print $1}' | xargs -r docker rm -f

# Clean up temporary directories
rm -rf tmp/*
