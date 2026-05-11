import { NextRequest } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

import { connectDB } from "@/lib/db";
import { getQuestions, LANGUAGE_SELECT } from "@/lib/questions";
import { handleOfficeFlow, handlePolicyFlow, handleProcessFlow } from "@/lib/flowHandlers";
import { processSessionWithAI } from "@/lib/ai";
import { transcribeTwilioAudio } from "@/lib/transcription";
import Office from "@/models/Office";
import Session from "@/models/Session";

// ── TwiML helper ──────────────────────────────────────────────────────────────

import { InteractiveMessage } from "@/lib/questions";

/**
 * Builds a Twilio MessagingResponse (TwiML) and returns it as a Web Response.
 * Twilio requires Content-Type: text/xml.
 */
async function sendInteractiveMessage(phone: string, msg: InteractiveMessage | string, lang: string = "mr"): Promise<Response> {
  const resp = new twilio.twiml.MessagingResponse();
  const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
  const toPhone = `whatsapp:${phone.startsWith("+") ? phone : "+" + phone}`;
  
  // ── 1. SIMPLE TEXT FALLBACK ──
  if (typeof msg === "string" || msg.type === "text") {
    resp.message(typeof msg === "string" ? msg : msg.text);
    return new Response(resp.toString(), { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }

  // ── 2. NATIVE WHATSAPP UI (BUTTONS & LISTS via Ephemeral Content API) ──
  try {
    let typesPayload: any = {};
    
    if (msg.type === "button") {
      typesPayload["twilio/quick-reply"] = {
        body: msg.text,
        actions: msg.options?.map((opt, idx) => ({
          id: `btn_${idx}`,     // ID sent to webhook behind the scenes
          title: opt.substring(0, 20) // WhatsApp max 20 chars for button title
        }))
      };
    } else if (msg.type === "list") {
      typesPayload["twilio/list-picker"] = {
        body: msg.text,
        button: lang === "en" ? "Select Option" : "पर्याय निवडा",
        items: msg.options?.map((opt, idx) => ({
          id: `list_${idx}`,    // ID sent to webhook behind the scenes
          item: opt             // The exact text shown on the radio button
        }))
      };
    }

    // A. Create temporary Content Resource
    const content = await client.content.v1.contents.create({
      friendlyName: `Ephemeral_${msg.type}_${Date.now()}`,
      language: lang, 
      variables: {},
      // @ts-ignore
      types: typesPayload
    });

    // B. Send message natively
    await client.messages.create({
      contentSid: content.sid,
      from: fromPhone,
      to: toPhone
    });

    // C. Fire-and-forget delete to prevent cluttering Twilio console
    client.content.v1.contents(content.sid).remove().catch(err => console.error("Could not delete temp content", err));

    // D. Return empty TwiML since we already sent via REST API
    return new Response(resp.toString(), { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } });

  } catch (err) {
    console.error("[Twilio Webhook] Interactive API Failed, falling back to text:", err);
    // ── 3. GRACEFUL FALLBACK TO TEXT MESSAGE ──
    let body = msg.text;
    if (msg.options && msg.options.length > 0) {
      body += "\n\n";
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      msg.options.forEach((opt, idx) => {
        const prefix = emojis[idx] || `${idx + 1}.`;
        body += `${prefix} ${opt}\n`;
      });
      body += "\n(Reply with the number or exact text)";
    }
    resp.message(body.trim());
    return new Response(resp.toString(), { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }
}

// ── Twilio signature validation ───────────────────────────────────────────────

/**
 * Validates that the incoming request actually comes from Twilio.
 * Enable by setting TWILIO_VALIDATE_REQUESTS=true in your environment.
 */
function validateTwilioSignature(
  request: NextRequest,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!authToken || !appUrl) {
    console.warn(
      "[Twilio] TWILIO_AUTH_TOKEN or NEXT_PUBLIC_APP_URL not set — skipping validation"
    );
    return true;
  }

  const twilioSignature =
    request.headers.get("x-twilio-signature") ?? "";
  const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/twilio/webhook`;

  return twilio.validateRequest(authToken, twilioSignature, webhookUrl, params);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Parse Twilio's application/x-www-form-urlencoded body
    const formData = await request.formData();

    const from = formData.get("From") as string | null;
    const body = formData.get("Body") as string | null;
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);
    const mediaUrl = formData.get("MediaUrl0") as string | null;
    const mediaType = formData.get("MediaContentType0") as string | null;

    // Twilio sends interactive list/button responses in separate fields
    const listTitle = formData.get("ListTitle") as string | null;
    const buttonText = formData.get("ButtonText") as string | null;

    if (!from) {
      return new Response("Bad Request: missing From or Body", { status: 400 });
    }

    // 2. Optional Twilio request signature validation (recommended in production)
    if (process.env.TWILIO_VALIDATE_REQUESTS === "true") {
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value as string;
      });

      if (!validateTwilioSignature(request, params)) {
        console.warn("[Twilio] Invalid request signature — rejecting");
        return new Response("Forbidden", { status: 403 });
      }
    }

    // 3. Normalise values — prefer interactive response fields over Body
    const phone = from.replace(/^whatsapp:/i, "").trim();       // e.g. +919876543210
    let messageText = (listTitle || buttonText || body || "").trim();
    let messageUpper = messageText.toUpperCase();

    console.log(`[Webhook] From=${phone} Body="${body}" ListTitle="${listTitle}" ButtonText="${buttonText}" → messageText="${messageText}"`);

    // 4. Connect to MongoDB
    await connectDB();

    // ── Handle visible QR sentence like:
    // "I want to give feedback for my visit to {office_name} ({office_id})"
    // Using the `s` (dotAll) flag so `.+?` matches newlines inside multi-line office names.
    const visibleRegex = /^I want to give feedback for my visit to\s+([\s\S]+?)\s*\(([^)]+)\)\s*$/is;
    const visibleMatch = messageText.match(visibleRegex);
    if (visibleMatch) {
      const officeId = visibleMatch[2].trim();
      return startSession(officeId);
    }

    // ── Helper: start a new session for a given officeId ───────────────────
    async function startSession(officeId: string): Promise<Response> {
      const QUESTIONS = getQuestions(null); // Default to MR
      const office = await Office.findOne({ office_id: officeId }).lean();
      if (!office) {
        return await sendInteractiveMessage(phone,QUESTIONS.OFFICE_NOT_FOUND(officeId), "mr");
      }

      // Close any previously open sessions for this phone (idempotent restart)
      await Session.updateMany(
        { phone, completed: false },
        { $set: { completed: true, current_step: 15 } } // Mark as completed (legacy was 5, 12, now arbitrary > max)
      );

      // Create a fresh session
      await Session.create({
        phone,
        language: null,
        office_id: officeId,
        office_name: office.office_name,
        current_step: 1, // Step 1 is now language
        completed: false,
        answers: {
          flow_choice: null,
          rating: null,
          feedback: null,
          scheme_suggestion: null,
          policy_suggestion: null,
        },
      });

      return await sendInteractiveMessage(phone,LANGUAGE_SELECT, "mr");
    }

    // ── Handle START_OFFICE_<id>  (legacy / fallback trigger) ────────────────
    if (messageUpper.startsWith("START_OFFICE_")) {
      const officeId = messageText.replace(/START_OFFICE_/i, "").trim();
      if (!officeId) {
        return await sendInteractiveMessage(phone,
          "⚠️ Invalid QR code format. Please scan the correct QR code at the office."
        );
      }
      return startSession(officeId);
    }

    // ── Handle bare office_id  (sent by the new QR codes) ───────────────────
    // When a citizen scans the QR the pre-filled text is just the office ID
    // (e.g. "1023"). If there is no existing active session we treat ANY
    // message as a potential office_id lookup first.
    const existingSession = await Session.findOne({
      phone,
      completed: false,
    }).sort({ created_at: -1 });

    if (!existingSession) {
      // No active session — try to start one using the message as an office_id or digipin
      const officeCandidate = messageText.trim();
      const matchedOffice = await Office.findOne({
        $or: [
          { office_id: officeCandidate },
          { digipin: officeCandidate }
        ]
      }).lean();

      if (matchedOffice) {
        return startSession(officeCandidate);
      }

      // Not a valid office_id either — prompt the citizen to scan
      return await sendInteractiveMessage(phone,
        "👋 Welcome to the Government Feedback System.\n\nTo share your feedback, please *scan the QR code* at the government office counter."
      );
    }

    // active session exists — fall through directly to the state machine
    const session = existingSession;
    let QUESTIONS = getQuestions(session.language || "mr");

    // ── Conversation state machine ─────────────────────────────────────────────
    if (session.current_step === 1) {
      // ── Step 1: Language Select ──
      const isMarathi = messageText === "1" || messageText === "मराठी";
      const isEnglish = messageText === "2" || messageText.toLowerCase() === "english";
      
      if (!isMarathi && !isEnglish) {
        return await sendInteractiveMessage(phone,QUESTIONS.INVALID_OPTION, session.language || "mr");
      }

      session.language = isMarathi ? "mr" : "en";
      session.current_step = 2; // Move to greeting
      await session.save();

      QUESTIONS = getQuestions(session.language);
      return await sendInteractiveMessage(phone,QUESTIONS.GREETING(session.office_name), session.language || "mr");
    }
    else if (session.current_step === 2) {
      // ── Step 2: User picks flow (Office = 1, Policy = 2, Process = 3) ──
      let choice = parseInt(messageText, 10);
      
      if (messageText === "कार्यालय अनुभव" || messageText === "Office Experience") choice = 1;
      if (messageText === "धोरण सूचना" || messageText === "Policy Suggestion") choice = 2;
      if (messageText === "प्रक्रिया सुधारणा" || messageText === "Process Reform") choice = 3;

      if (![1, 2, 3].includes(choice)) {
        return await sendInteractiveMessage(phone,QUESTIONS.INVALID_OPTION, session.language || "mr");
      }

      session.answers.flow_choice = choice;
      session.current_step = 3;
      await session.save();

      if (choice === 1) return await sendInteractiveMessage(phone,QUESTIONS.CAT1_Q1, session.language || "mr");
      if (choice === 2) return await sendInteractiveMessage(phone,QUESTIONS.CAT2_FLOW_SELECT, session.language || "mr");
      if (choice === 3) return await sendInteractiveMessage(phone,QUESTIONS.CAT3_Q1_CHANGE, session.language || "mr");

      return await sendInteractiveMessage(phone,QUESTIONS.ERROR, session.language || "mr");
    }
    else if (session.completed) {
      // ── Session already complete ────────────────────────────────────────────
      return await sendInteractiveMessage(phone,QUESTIONS.SESSION_COMPLETED, session.language || "mr");
    }
    else if (session.current_step >= 3 && session.current_step <= 21) {
      // ── Audio Transcription Intercept ─────────────────────────────────────────
      if (numMedia > 0 && mediaUrl && mediaType?.startsWith("audio/")) {
        // Validate if audio is allowed for the CURRENT step the citizen is on
        const isAudioAllowed =
          (session.answers.flow_choice === 1 && session.current_step === 12) || // Office Exp: Q10
          (session.answers.flow_choice === 2 && session.current_step === 10) || // Policy Sugg: Mandatory Feedback
          (session.answers.flow_choice === 3 && session.current_step === 4);   // Process Ref: Suggestion

        if (!isAudioAllowed) {
          return await sendInteractiveMessage(phone,"⚠️ Please reply with text/numbers for this step. Voice notes are only accepted for detailed descriptive feedback later in the flow.", session.language || "mr");
        }

        // Allowed -> transcribe async and block the flow until we get the text
        const transcribedText = await transcribeTwilioAudio(mediaUrl);
        if (transcribedText.startsWith("[Audio")) {
          return await sendInteractiveMessage(phone,`⚠️ ${transcribedText}`, session.language || "mr");
        }

        // Override the empty messageText with the transcribed string
        messageText = `[VOICE-NOTE]: ${transcribedText}`;
      }

      // ── Hand off to specific flow handlers ──────────────────────────────────
      let flowRes: { message: InteractiveMessage; nextStep: number; completed: boolean };

      switch (session.answers.flow_choice) {
        case 1:
          flowRes = await handleOfficeFlow(session, messageText);
          break;
        case 2:
          flowRes = await handlePolicyFlow(session, messageText);
          break;
        case 3:
          flowRes = await handleProcessFlow(session, messageText);
          break;
        default:
          return await sendInteractiveMessage(phone,QUESTIONS.ERROR, session.language || "mr");
      }

      session.current_step = flowRes.nextStep as any;
      if (flowRes.completed) {
        session.completed = true;
      }
      await session.save();

      // Launch async AI sentiment extraction completely independent of the WhatsApp Twilio loop so timeout never hits
      // We only do this here if completed was set to true directly by a flow handler somehow, 
      // though now they all go to Step 21. Just in case of fallback:
      if (flowRes.completed) {
        processSessionWithAI(
          session._id.toString(),
          session.office_id,
          session.answers,
          session.answers.completed_flows.join(",") || String(session.answers.flow_choice)
        ).catch((err) => console.error("Async AI Error tracking", err));
      }

      return await sendInteractiveMessage(phone,flowRes.message, session.language || "mr");
    }
    else if (session.current_step === 22) {
      const QUESTIONS = getQuestions(session.language);
      // ── Step 22: Continue Menu (Multi-Flow Submission) ────────────────────
      let choice = parseInt(messageText, 10);
      
      if (messageText === "पूर्ण करा" || messageText === "Submit and Finish" || choice === 4) choice = 0;
      if (messageText === "कार्यालय अनुभव" || messageText === "कार्यालय अनुभव ✅" || messageText === "Office Experience" || messageText === "Office Experience ✅") choice = 1;
      if (messageText === "धोरण सूचना" || messageText === "धोरण सूचना ✅" || messageText === "Policy Suggestion" || messageText === "Policy Suggestion ✅") choice = 2;
      if (messageText === "प्रक्रिया सुधारणा" || messageText === "प्रक्रिया सुधारणा ✅" || messageText === "Process Reform" || messageText === "Process Reform ✅") choice = 3;
      
      // Submit and Finish
      if (choice === 0) {
        session.completed = true;
        await session.save();
        
        // Launch AI sentiment extraction for all combined flows
        await processSessionWithAI(
          session._id.toString(),
          session.office_id,
          session.answers,
          session.answers.completed_flows.join(",")
        ).catch((err) => console.error("Async AI Error tracking", err));
        
        const FINAL_Q = getQuestions(session.language);
        return await sendInteractiveMessage(phone,FINAL_Q.FINAL_PROCESS, session.language || "mr");
      }
      
      // Loop back to another flow
      if ([1, 2, 3].includes(choice)) {
        if (session.answers.completed_flows.includes(choice)) {
          return await sendInteractiveMessage(phone,QUESTIONS.CONTINUE_MENU(session.answers.completed_flows), session.language || "mr");
        }
        
        // Update flow choice and reset to Step 3
        session.answers.flow_choice = choice;
        session.current_step = 3;
        await session.save();
        
        if (choice === 1) return await sendInteractiveMessage(phone,QUESTIONS.CAT1_Q1, session.language || "mr");
        if (choice === 2) return await sendInteractiveMessage(phone,QUESTIONS.CAT2_FLOW_SELECT, session.language || "mr");
        if (choice === 3) return await sendInteractiveMessage(phone,QUESTIONS.CAT3_Q1_CHANGE, session.language || "mr");
      }
      
      return await sendInteractiveMessage(phone,QUESTIONS.INVALID_OPTION, session.language || "mr");
    }
    else {
      // ── Unknown state ────────────────────────────────────────────────────────
      console.error(
        `[Twilio Webhook] Unknown session step ${session.current_step} for phone ${phone}`
      );
      const QUESTIONS = getQuestions(session.language);
      return await sendInteractiveMessage(phone,QUESTIONS.ERROR, session.language || "mr");
    }
  } catch (error) {
    // Log the full error server-side, never expose internals to WhatsApp
    console.error("[Twilio Webhook] Unhandled error:", error);

    const QUESTIONS = getQuestions(null);
    // Return a valid TwiML 200 response so Twilio doesn't retry
    const errResp = new twilio.twiml.MessagingResponse();
    errResp.message(QUESTIONS.ERROR.text);
    return new Response(errResp.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }
}
