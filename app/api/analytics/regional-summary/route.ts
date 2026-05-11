import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";
import Escalation from "@/models/Escalation";
import RegionalSummary from "@/models/RegionalSummary";
import { OpenAI } from "openai";

export const dynamic = "force-dynamic";

const deepseek = process.env.DEEPSEEK_API_KEY ? new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com"}) : null;

// Cache lifetime: 24 hours
const CACHE_TTL_HOURS = 24;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const regionType = searchParams.get("type"); // state, division, district, taluka
        const regionName = searchParams.get("name");
        const forceRefresh = searchParams.get("refresh") === "true";

        if (!regionType || !regionName) {
            return NextResponse.json(
                { error: "Must provide 'type' and 'name' query parameters." },
                { status: 400 }
            );
        }

        const validTypes = ["state", "division", "district", "taluka"];
        if (!validTypes.includes(regionType)) {
            return NextResponse.json({ error: "Invalid region type." }, { status: 400 });
        }

        // 1. Check Cache first
        if (!forceRefresh) {
            const cached = await RegionalSummary.findOne({
                region_type: regionType,
                region_name: regionName,
            }).lean();

            if (cached) {
                // Return cache directly
                return NextResponse.json({
                    success: true,
                    cached: true,
                    data: cached,
                });
            }
        }

        // 2. Fetch Raw Data for Aggregation
        const query: Record<string, any> = { is_active: true };
        query[regionType] = regionName;

        const offices = await Office.find(query).lean();

        if (offices.length === 0) {
            return NextResponse.json({
                success: true,
                cached: false,
                data: {
                    region_type: regionType,
                    region_name: regionName,
                    summary_text: "No active offices found in this region to summarize.",
                    metrics: { total_offices: 0, avg_omes: 0, open_escalations: 0 },
                    top_themes: [],
                }
            });
        }

        // 3. Aggregate Metrics
        let totalOmes = 0;
        let omesCount = 0;
        const themeFrequencies: Record<string, number> = {};

        offices.forEach((o: any) => {
            if (o.metadata?.omes) {
                totalOmes += o.metadata.omes;
                omesCount++;
            }
            if (o.metadata?.themes && Array.isArray(o.metadata.themes)) {
                o.metadata.themes.forEach((t: string) => {
                    themeFrequencies[t] = (themeFrequencies[t] || 0) + 1;
                });
            }
        });

        const avgOmes = omesCount > 0 ? (totalOmes / omesCount).toFixed(2) : 0;

        const topThemes = Object.entries(themeFrequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(e => e[0]);

        // Find open escalations in this exact region
        const escQuery: Record<string, any> = { status: "open" };
        escQuery[regionType] = regionName;
        const openEscalationsCount = await Escalation.countDocuments(escQuery);

        const metricsInfo = {
            total_offices: offices.length,
            avg_omes: Number(avgOmes),
            open_escalations: openEscalationsCount,
        };

        // 4. Trigger OpenAI
        let summaryText = `This region contains ${offices.length} offices with an average OMES of ${avgOmes}.`;

        if (deepseek) {
            const prompt = `
You are the Chief Secretary AI for the Government of Maharashtra.
Provide a concise, 3-paragraph executive summary on the performance of the ${regionName} ${regionType}.

Here is the data:
- Total Offices: ${offices.length}
- Average Regional OMES (out of 5.0): ${avgOmes} (Scores below 3.0 denote poor health)
- Active Escalations: ${openEscalationsCount}
- Top Recurring Citizen Feedback Themes: ${topThemes.join(", ") || "None recorded"}

Write it in a professional, no-nonsense administrative tone.
1st paragraph: The general health and OMES performance.
2nd paragraph: Insights on the top feedback themes.
3rd paragraph: Mention the active escalations and whether intervention is needed.
Do not use markdown headers, just return paragraph text.
`;

            try {
                const aiRes = await deepseek.chat.completions.create({
                    model: "deepseek-v4-flash", // fast and cheap for text synthesis
                    messages: [{ role: "system", content: prompt }],
                    temperature: 0.3,
                });
                summaryText = aiRes.choices[0]?.message?.content?.trim() || summaryText;
            } catch (err: any) {
                console.error("[Regional Summary] Deepseek Error:", err);
                if (err.code === 'insufficient_quota' || err.status === 429) {
                    summaryText = "⚠️ [AI Quota Exceeded] You have reached your OpenAI billing limit or quota. Please check your OpenAI dashboard (platform.openai.com) to add credits. \n\n" + summaryText;
                } else {
                    summaryText = "[AI Generation Failed] " + summaryText;
                }
            }
        } else {
            summaryText = "[DEEPSEEK_API_KEY Missing] " + summaryText;
        }

        // 5. Save to Cache
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

        // Upsert the RegionalSummary so we don't have duplicates
        const updatedDoc = await RegionalSummary.findOneAndUpdate(
            { region_type: regionType, region_name: regionName },
            {
                $set: {
                    summary_text: summaryText,
                    metrics: metricsInfo,
                    top_themes: topThemes,
                    expires_at: expiresAt,
                }
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        ).lean();

        return NextResponse.json({
            success: true,
            cached: false, // Indicate we just generated a fresh one
            data: updatedDoc,
        });

    } catch (error: any) {
        console.error("[Regional Summary AI Route Error]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
