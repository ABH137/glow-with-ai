export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server missing OpenAI API key' });
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'You are a professional skin analyst. Analyze the uploaded skin image and return only valid JSON with the following keys: skinType, skinAge, glowScore, concerns, acneZones, darkSpots, wrinkles, hydration, uvDamage, eyeArea, porosity, recommendations, summary.'
              },
              {
                type: 'input_image',
                image_url: imageBase64
              }
            ]
          }
        ]
      })
    });

    const data = await openAIResponse.json();
    if (!openAIResponse.ok) {
      console.error('OpenAI error:', data);
      return res.status(502).json({ error: 'OpenAI API error', details: data });
    }

    const outputItems = Array.isArray(data.output) ? data.output : [];
    const textParts = outputItems.flatMap((item) =>
      Array.isArray(item.content)
        ? item.content.filter((c) => c.type === 'output_text').map((c) => c.text)
        : []
    );
    const rawText = textParts.join('\n').trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      console.error('Could not parse JSON from OpenAI response:', rawText);
      return res.status(500).json({ error: 'Invalid analysis response from AI' });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
