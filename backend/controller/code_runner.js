const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { v4: uuid } = require("uuid");
const { json } = require("body-parser");

const runPythonCode = async (req, res) => {
  const folderId = uuid();
  const folderPath = path.join(__dirname, "..", "temp", folderId);
  fs.mkdirSync(folderPath, { recursive: true });

  const code = req.body.code;
  const input = req.body.input || "";

  fs.writeFileSync(path.join(folderPath, "main.py"), code);
  fs.writeFileSync(path.join(folderPath, "input.txt"), input);
  const docker = spawn("docker", [
  "run",
  "--rm",
  "--network=none",
  "-v",
  `${folderPath}:/app/temp`, // ✅ mount to subfolder to preserve runner.py
  "python-runner",],
  {
    timeout:7000
  }
);
  let output = "";
  let error = "";

  docker.stdout.on("data", (data) => (output += data.toString()));
  docker.stderr.on("data", (data) => (error += data.toString()));
  
    docker.on("error", () => {
        res.status(500).json({ error: "Execution timeout" });
    });

  // in runPythonCode function in Node.js
    docker.on("close", () => {
        fs.rmSync(folderPath, { recursive: true, force: true });
            // If there was a system-level error, prioritize showing that.
            if (error) {
                return res.status(500).json({ error: error });
            }
            try {
                const result = JSON.parse(output.trim());
                return res.status(200).json(result);
            } 
            catch (e) {
                // If parsing fails, return the raw output for debugging.
                return res.status(500).json({
                error: "Execution protocol violated",
                rawOutput: output,
                rawError: error
            });
    
        }
    
    });

};


const runJavaCode = async(req,res)=>{
    try {
        const user_code = req.body.code;
        const user_input = req.body.input || '';
        const folderId = uuid();
        const folderpath = path.join(__dirname,"..","temp",folderId);
        fs.mkdirSync(folderpath,{recursive:true});
        fs.writeFileSync(path.join(folderpath,"Main.java"),user_code);
        fs.writeFileSync(path.join(folderpath,"input.txt"),user_input);

        const javaProcess = new spawn("docker",[
            "run",
            "--rm",
            "--network=none",
            "-v",
            `${folderpath}:/app/temp`,
            "java-runner"
        ]);

        let output = '';
        let error = '';
        javaProcess.stdout.on("data",(data)=>{
            output += data.toString();
        })
        javaProcess.stderr.on("data",(data)=>{
            error += data.toString();
        })

        javaProcess.on("close", () => {
    fs.rmSync(folderpath, { recursive: true, force: true });

    if (error) {
        return res.status(403).json({ error });
    }

    try {
        const result = JSON.parse(output.trim())
        return res.status(200).json(result)
      } catch (e) {
        console.log("Parsing error:", e, "Raw output:", output);
        return res.status(500).json({ error: "Error Occurred During parsing" });
      }
});



    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
}

const runCppCode = async(req,res)=>{
    try {
        const user_code = req.body.code;
        const user_input = req.body.input || '';
        const folderId = uuid();
        const folderPath = path.join(__dirname,"..","temp",folderId);
        fs.mkdirSync(folderPath,{recursive:true});
        fs.writeFileSync(path.join(folderPath,"Main.cpp"),user_code);
        fs.writeFileSync(path.join(folderPath,"input.txt"),user_input);
        const cppProcess =  new spawn("docker",[
            "run",
            "--rm",
            "--network=none",
            "-v",
            `${folderPath}:/app/temp`,
            "cpp-runner"
        ]);
        let output = '';
        let error = '';
        cppProcess.stdout.on("data",(data)=>{
            output += data.toString();
        })
        cppProcess.stderr.on("data",(data)=>{
            error += data.toString();
        });
        cppProcess.on("close",()=>{
            fs.rmSync(folderPath,{recursive:true,force:true});
            if(error){
                return res.status(403).json({error:error});
            }
            try {
                const result = JSON.parse(output);
                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({error:"Output formatting error"});
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
}

module.exports = { runPythonCode,runJavaCode,runCppCode};
