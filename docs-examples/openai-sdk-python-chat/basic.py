import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(override=True)

if not os.getenv('LAYER_API_KEY') or not os.getenv('GATE_ID'):
    print('Error: LAYER_API_KEY and GATE_ID environment variables are required')
    print('Copy .env.example to .env and fill in your credentials')
    exit(1)

client = OpenAI(
    base_url="https://api.uselayer.ai/v1",
    api_key=os.getenv('LAYER_API_KEY'),
)

response = client.chat.completions.create(
    model=os.getenv('GATE_ID'),
    messages=[
        {"role": "user", "content": "Hello! Tell me a fun fact about space."}
    ]
)

print('Chat completion successful!')
print('Response:', response.choices[0].message.content)
print('Model:', response.model)
print('Usage:', response.usage)
