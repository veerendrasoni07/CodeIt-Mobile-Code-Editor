#!/bin/sh

cd temp


# here Main.cpp is our code file || -o Main is use to name the compiled code file that we get after complitation
g++ Main.cpp -o Main 2> compile_error.txt

# [ -s compile_error.txt ] is using for checking that is our compile.txt file contains any byte or not
if [ -s compile_error.txt ]; then
    echo "{\"error\":\"$(cat compile_error.txt | head -n 10 | tr '\n' ' ' )\"}"
    exit 0
fi

# here we are defining timeout 5 to make sure our program do not take more than 5 sec to complete the program
# ./Main is use to run the compiled "Main" file 
output=$(timeout 5 ./Main < input.txt)

escaped_output=$(printf "%s" "$output" \
    | sed 's/\\/\\\\/g' \
    | sed 's/\"/\\"/g' \
    | sed ':a;N;$!ba;s/\n/\\n/g'
)

echo "{\"output\":\"$escaped_output\"}"