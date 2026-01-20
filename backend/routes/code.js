const express = require('express')
const codeRouter = express.Router();
const {runPythonCode,runJavaCode,runCppCode} = require('../controller/code_runner');

codeRouter.post('/api/run-code',runPythonCode);
codeRouter.post('/api/run-java',runJavaCode);
codeRouter.post('/api/run-cpp',runCppCode);
module.exports = codeRouter;