
import json
import subprocess



INPUT_PATH='./temp/input.txt'
CODE_PATH='./temp/main.py'


try:
    with open(INPUT_PATH,"r") as f:
        user_input = f.read()
    result = subprocess.run(
        ["python3",CODE_PATH],
        input=user_input,
        text=True,
        capture_output=True,
        timeout=5,
    )
    response = {
        "stdout":result.stdout,
        "stderr":result.stderr,
        "exitCode":result.returncode
    }
except subprocess.TimeoutExpired:
    response = {
        "stdout": "",
        "stderr": "Time Limit Exceeded",
        "exitCode": 124
    }
except Exception as e:
    response = {
        "stdout": "",
        "stderr": str(e),
        "exitCode": 1
    }

print(json.dumps(response)) 



