#!/bin/bash

# Scroll and collect tweets
for i in {1..10}; do
  openclaw browser press End 2>&1 > /dev/null
  sleep 2
done

# Get the final snapshot
openclaw browser snapshot --format aria 2>&1