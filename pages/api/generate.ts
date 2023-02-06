import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

type Data = {
    error?: {
        message: string
    };
    result?: string
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export default async function generate(req: NextApiRequest,
    res: NextApiResponse<Data>) {

    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }

    const question = req.body.question || '';
    if (question.trim().length === 0) {
        res.status(400).json({
            error: {
                message: "Please enter a valid question",
            }
        });
        return;
    }

    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(question),
            temperature: 1,
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch (error:any) {
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

function generatePrompt(question:string) {
    const capitalizedCountry =
    question[0].toUpperCase() + question.slice(1).toLowerCase();
    return `${capitalizedCountry}`;
}