#!/bin/bash

cd temp || exit 1

# Compile Java
javac Main.java 2> compile_error.txt || true

if [ -s compile_error.txt ]; then
    err=$(head -n 10 compile_error.txt | tr '\n' ' ' | sed 's/\\/\\\\/g' | sed 's/\"/\\"/g')
    echo "{\"error\":\"$err\"}"
    exit 0
fi

output=$(java Main < input.txt 2>&1)

escaped_output=$(printf "%s" "$output" \
    | sed 's/\\/\\\\/g' \
    | sed 's/\"/\\"/g' \
    | sed ':a;N;$!ba;s/\n/\\n/g')

echo "{\"output\":\"$escaped_output\"}"
