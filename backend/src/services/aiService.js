const axios = require('axios');
const config = require('../config/env');

async function callOpenRouter(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: config.openrouterModel,
        messages: [
          { role: 'system', content: 'You are a helpful placement portal assistant. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.openrouterApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    throw error;
  }
}

module.exports = { callOpenRouter };
