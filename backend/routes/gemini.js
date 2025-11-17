const express = require('express');
const {geminiController} = require('../controller/gemini_controller');
const geminiRouter = express.Router();

geminiRouter.post('/api/run',geminiController);

module.exports = geminiRouter;