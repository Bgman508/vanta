import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { content, type } = await req.json();

    const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this ${type} content for policy violations. Check for: hate speech, harassment, explicit content, spam, copyright infringement. Content: "${content}". Return JSON with: {allowed: boolean, reason: string, confidence: number}`,
      response_json_schema: {
        type: "object",
        properties: {
          allowed: { type: "boolean" },
          reason: { type: "string" },
          confidence: { type: "number" }
        }
      }
    });

    return Response.json(moderationResult);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});