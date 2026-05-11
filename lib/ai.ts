import { OpenAI } from "openai";
import Session from "@/models/Session";
import { computeOfficeMetrics } from "./metrics";
import { checkEscalationForOffice } from "./escalation";


// Ensure we don't crash if the key is missing during build or early dev
const deepseek = process.env.DEEPSEEK_API_KEY
    ? new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com"
     })
    : null;

export async function processSessionWithAI(sessionId: string, officeId: string, answers: any, completedFlowsStr: string | null) {
    console.log("DeepSeek Key Exists:", !!process.env.DEEPSEEK_API_KEY);
    console.log("Deepseek object:", !!deepseek);
    if (!deepseek) {
        console.warn("DEEPSEEK_API_KEY not set. Skipping AI analysis.");
        return null;
    }

    const flowIds = completedFlowsStr ? completedFlowsStr.split(",").map(Number) : [];
    
    // Map IDs back to readable names for the AI prompt
    const flowNames = flowIds.map(id => {
        if (id === 1) return "Office Experience";
        if (id === 2) return "Policy Suggestion";
        if (id === 3) return "Process Reform";
        return "Unknown Flow";
    }).join(", ");

    const flowName = flowNames || "Mixed / Unknown";

    const prompt = `
You are an expert citizen governance intelligence AI for the Government of Maharashtra.
Analyze the following citizen feedback submission carefully.

Flow Type: ${flowName}

Citizen Form Data (Raw):
${JSON.stringify(answers, null, 2)}

Provide your analysis in the exact JSON format below. Do not use markdown wrappers.
{
  "sentiment": "Positive", // Must be "Positive", "Neutral", or "Negative"
  "confidence": 95, // Integer (0 to 100)
  "themes": ["Staff Behavior", "Line Management"], // Minimum 1, Maximum 3 broad themes
  "translated_text": "Clear English summary or translation of any free-text provided.",
  "keywords": ["tag1", "tag2"], // Highly specific single-word tags (up to 4)
  "reform_recommendation": "One sentence actionable recommendation for the department.",
  "direct_response_to_citizen": "Write a polite, personalized 1-to-2 sentence response addressed directly to the citizen (using 'you'). IMPORTANT: Base your response on the 'translated_text' field above — that is the clean English interpretation of their input. Do NOT interpret raw '[VOICE-NOTE]' text directly as it may be garbled or in a non-Latin script. If their request or suggestion relates to a service or scheme that already exists in Maharashtra (e.g. Mahila Samman Yojana for women's bus travel discounts, PM-KISAN for farmer subsidies), briefly inform them about it. If it is a complaint, assure them the relevant department will review it."
}
`;

    try {
        console.log(`[AI] Triggering NLP analysis for Session ${sessionId}...`);

        // Quick, cheap, fast model
        const response = await deepseek.chat.completions.create({
            model: "deepseek-v4-flash",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
        });

        const aiResult = JSON.parse(response.choices[0].message.content || "{}");

        // Validate output structure softly
        const finalPayload = {
            sentiment: ["Positive", "Neutral", "Negative"].includes(aiResult.sentiment)
                ? aiResult.sentiment
                : "Neutral",
            confidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : 50,
            themes: Array.isArray(aiResult.themes) ? aiResult.themes : [],
            translated_text: aiResult.translated_text || null,
            keywords: Array.isArray(aiResult.keywords) ? aiResult.keywords : [],
            reform_recommendation: aiResult.reform_recommendation || null,
            direct_response_to_citizen: aiResult.direct_response_to_citizen || null,
        };

        // Commit to MongoDB
        const updatedSession = await Session.findByIdAndUpdate(sessionId, {
            $set: { ai_analysis: finalPayload }
        }, { new: true });

        console.log(`[AI] Analysis complete & saved for Session ${sessionId}`);

        // ── Direct AI WhatsApp Auto-Responder ──
        if (updatedSession?.phone && finalPayload.direct_response_to_citizen) {
            try {
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

                if (accountSid && authToken && fromNumber) {
                    const twilioClient = require('twilio')(accountSid, authToken);
                    await twilioClient.messages.create({
                        from: fromNumber,
                        to: `whatsapp:${updatedSession.phone}`,
                        body: `🤖 *MahaGov AI Update*\n\n${finalPayload.direct_response_to_citizen}`
                    });
                    console.log(`[Twilio] Successfully sent AI auto-response to ${updatedSession.phone}`);
                }
            } catch (twilioErr) {
                console.error("[Twilio] Failed to send AI auto-response:", twilioErr);
                // Do not throw; let metrics and escalations proceed
            }
        }

        // Trigger the recalculation of the specific Office's dashboard statistics
        await computeOfficeMetrics(officeId);

        // Trigger escalation check — if this office has sustained poor OMES, raise an alert
        await checkEscalationForOffice(officeId);

        return finalPayload;

    } catch (error) {
        console.error("[AI] Error during Deepseek Analysis:", error);
        return null;
    }
}
