const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { v4: uuid } = require("uuid");

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
  "python-runner"
]);
  let output = "";
  let error = "";

  docker.stdout.on("data", (data) => (output += data.toString()));
  docker.stderr.on("data", (data) => (error += data.toString()));

  // in runPythonCode function in Node.js
    docker.on("close", () => {
        fs.rmSync(folderPath, { recursive: true, force: true });
            // If there was a system-level error, prioritize showing that.
            if (error) {
                return res.status(500).json({ error: error });
            }
            try {
                const parsed = JSON.parse(output);
                if (parsed.error) {
                    return res.status(400).json({ error: parsed.error });
                }
                return res.status(200).json({ output: parsed.output });
            } 
            catch (e) {
                // If parsing fails, return the raw output for debugging.
                return res.status(500).json({
                error: "Invalid output format from execution engine.",
                raw_output: output 
        
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
        const jsonStart = output.indexOf("{");
        const jsonEnd = output.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = output.slice(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonString);
          if (parsed.error) {
            return res.status(403).json({ error: parsed.error });
          }
          return res.status(200).json({ output: parsed.output });
        } else {
          throw new Error("No JSON found in output");
        }
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
                const parsed = JSON.parse(output);
                if(parsed.error){
                    return res.status(403).json(parsed.error);
                }
                return res.status(200).json(parsed.output);
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
