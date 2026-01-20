import subprocess,pathlib,sys,json


TEMP = pathlib.Path('./temp')

try:
    #compile the code first 
    cppCompile = subprocess.run(
        ["g++","Main.cpp","-o","Main"],
        cwd=TEMP,
        capture_output=True,
        text=True,
        timeout=5
    )

    if cppCompile.returncode !=0:
        print(json.dumps({
            "stdout": "",
            "stderr": cppCompile.stderr[:2000],
            "exitCode": cppCompile.returncode
        }))
        sys.exit(0)

    # Run the code node
    with open(TEMP/"input.txt") as f:
        cppRun = subprocess.run(
            ["Main"],
            capture_output=True,
            stdin=f,
            text=True,
            timeout=5
        )
    print(json.dumps({
        "stdout": cppRun.stdout,
        "stderr": cppRun.stderr,
        "exitCode": cppRun.returncode
    }))


except subprocess.TimeoutExpired:
    print(json.dumps({
        "stdout": "",
        "stderr": "Time Limit Exceeded",
        "exitCode": 124
    }))

except Exception as e:
    print(json.dumps({
        "stdout":"",
        "stderr":str(e),
        "exitCode":1
    }))