import subprocess, pathlib,sys,json


TEMP = pathlib.Path('./temp')

try:
    # compile
    jCompile = subprocess.run(
        ["javac","Main.java"],
        cwd=TEMP,
        capture_output=True,
        text=True,
        timeout=5
    )
    if jCompile.returncode != 0:
        print(json.dumps({
            "stdout": "",
            "stderr": jCompile.stderr[:2000],
            "exitCode": jCompile.returncode
        }))
        sys.exit(0)

    # run 
    with open(TEMP/"input.txt","r") as f:
        jRun = subprocess.run(
            ["java","Main"],
            cwd=TEMP,
            stdin=f,
            text=True,
            capture_output=True,
            timeout=5
        )
        print(json.dumps({
            "stdout": jRun.stdout,
            "stderr": jRun.stderr,
            "exitCode": jRun.returncode
        }))
except subprocess.TimeoutExpired:
    print(json.dumps({
        "stdout":"",
        "stderr":"Time Limit Exceeded",
        "exitCode":124
    }))

except Exception as e:
    print(json.dumps({
        "stdout":"",
        "stderr":str(e),
        "exitCode":1}))