const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeMedicalReport(filePath, mimeType) {
    try {
        const fileBytes = fs.readFileSync(filePath);
        const fileData = {
            inlineData: {
                data: fileBytes.toString("base64"),
                mimeType: mimeType
            }
        };

        // Step 1: Get severity classification (clean, short response)
        const severityResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [
                    { text: 'Analyze this medical report. Reply with ONLY one word - either NORMAL, MID, or EMERGENCY - based on the severity of the medical findings. No other text.' },
                    fileData
                ]
            }]
        });
        const severity = severityResponse.text.trim().replace(/[^A-Z]/g, '') || 'NORMAL';
        const validSeverity = ['NORMAL', 'MID', 'EMERGENCY'].includes(severity) ? severity : 'NORMAL';

        // Step 2: Get the full markdown analysis separately
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [
                    { text: `You are an expert AI Medical Report Analyzer. Analyze this report and provide a comprehensive summary in Markdown format with these sections:

## Patient Information
(If available, otherwise state "Not provided")

## Key Findings
What are the main results from the tests/scans?

## Abnormalities
Highlight any values that are out of normal ranges.

## Conclusion/Summary
A brief summary of the patient's health status.

## Recommendations
General next steps. Always include a disclaimer to consult a real doctor.

Be clear and easy to understand for a non-medical person.` },
                    fileData
                ]
            }]
        });
        const markdown_analysis = analysisResponse.text.trim();

        // Step 3: If EMERGENCY, get a 1-line urgent message with doctor recommendation
        let emergency_message = null;
        if (validSeverity === 'EMERGENCY') {
            const emergencyResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{
                    role: 'user',
                    parts: [
                        { text: 'Based on this medical report, write exactly 1 short urgent sentence (max 15 words) describing the main critical finding and the specific doctor specialty to consult (e.g. Cardiologist, Neurologist, Endocrinologist). No extra text.' },
                        fileData
                    ]
                }]
            });
            emergency_message = emergencyResponse.text.trim();
        }

        return { severity: validSeverity, markdown_analysis, emergency_message };

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze report with Gemini AI: " + error.message);
    }
}

module.exports = { analyzeMedicalReport };
