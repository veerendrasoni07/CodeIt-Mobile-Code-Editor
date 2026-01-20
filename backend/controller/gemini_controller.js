const {GoogleGenerativeAI} = require('@google/generative-ai');


const genAI = new GoogleGenerativeAI("AIzaSyBXz39wkWoSB9Ly307Vank5YBOImBKFODA");

const geminiController = async(req,res)=>{
    try {
        const user_question = req.body.question;
        const model = genAI.getGenerativeModel({model:"gemini-2.0-flash"});
        const result = await model.generateContent(user_question);
        const responseText = result.response.text();
        console.log(responseText);
        res.status(200).json({output:responseText});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
}

module.exports = {geminiController};