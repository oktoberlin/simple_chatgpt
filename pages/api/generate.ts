import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

// Create Data Type for res: NextApiResponse<Data> parameter of function generate()
type Data = {
    error?: {
        message: string
    };
    result?: string
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // api key will automatically be imported from .env file
});
const openai = new OpenAIApi(configuration);


export default async function generate(req: NextApiRequest,
    res: NextApiResponse<Data>) {
    
    // handling error in case API Key not configured
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }

    // Get input value from form on Submit event
    const question = req.body.question || '';
    if (question.trim().length === 0) {
        res.status(400).json({
            error: {
                message: "Please enter a valid question",
            }
        });
        return;
    }

    // generate answer from AI Model
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003", // Model AI type for generating text
            prompt: generatePrompt(question),
            temperature: 0.7,
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch (error: any) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                }
            });
        }
    }
}

function generatePrompt(question: string) {
    const capitalizedCountry =
        question[0].toUpperCase() + question.slice(1).toLowerCase(); // in case question text is capitalized
    return `${capitalizedCountry}`;
}