#!/bin/bash
npm run dev &
PID=$!
sleep 5
kill $PID 2>/dev/null
