#!/bin/bash

# Capture neurointervention search screenshots
echo "Capturing neurointervention search screenshots..."
openclaw browser focus neurointervention-search
sleep 2

for i in {1..5}; do
    openclaw browser screenshot
    if [ $i -lt 5 ]; then
        openclaw browser press PageDown
        sleep 3
    fi
done

# Capture AVM/aneurysm search screenshots
echo ""
echo "Capturing AVM/aneurysm search screenshots..."
openclaw browser focus avm-aneurysm-search
sleep 2

for i in {1..5}; do
    openclaw browser screenshot
    if [ $i -lt 5 ]; then
        openclaw browser press PageDown
        sleep 3
    fi
done

echo ""
echo "Screenshot capture complete!"