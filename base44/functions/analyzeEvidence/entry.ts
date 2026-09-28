import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Narrow, purpose-built AI operation for the emergency evidence flow.
// Never a generic proxy: fixed prompt shape, bounded input, fixed output schema.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.slice(0, 2000) : null;
    const description = typeof body.description === 'string' ? body.description.slice(0, 2000) : '';
    const emergencyType = typeof body.emergencyType === 'string' ? body.emergencyType.slice(0, 100) : '';

    if (!imageUrl) {
      return Response.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const schema = {
      type: 'object',
      properties: {
        detected_objects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              confidence: { type: 'number' },
            },
            required: ['label', 'confidence'],
          },
        },
        scene_notes: { type: 'array', items: { type: 'string' } },
        estimated_severity: { type: 'string', enum: ['low', 'moderate', 'high'] },
        suggestions: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['detected_objects', 'scene_notes', 'estimated_severity', 'suggestions', 'summary'],
    };

    const prompt =
      'You are an assistive (non-diagnostic) emergency-evidence analysis tool for a citizen emergency-response app. ' +
      'Analyze the attached photo from a reported "' + (emergencyType || 'emergency') + '" situation. ' +
      (description ? 'Additional context from the reporter: "' + description + '". ' : '') +
      'Identify visible objects/hazards relevant to emergency responders (e.g. vehicles, injuries, hazards, people, ambulance, road signs). ' +
      'For each, give a short label and a confidence 0-1. List 3-5 short factual scene observations (never a medical diagnosis). ' +
      'Estimate an overall severity (low/moderate/high) purely from visual damage/hazard cues. ' +
      'Give up to 3 short actionable suggestions for responders (e.g. "Alert traffic control"). ' +
      'Write a 2-3 sentence neutral summary suitable for a responder to read quickly. ' +
      'Use clearly informational, non-diagnostic language throughout.';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [imageUrl],
      response_json_schema: schema,
    });

    return Response.json({ status: 'success', analysis: result });
  } catch (error) {
    return Response.json({ status: 'error', error: error.message }, { status: 500 });
  }
}