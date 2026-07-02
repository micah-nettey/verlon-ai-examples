import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(override=True)

if not os.getenv('VERLON_API_KEY') or not os.getenv('VERLON_GATE_ID'):
    print('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required')
    print('Copy .env.example to .env and fill in your credentials')
    exit(1)

client = OpenAI(
    base_url="https://api.verlon.ai/v1",
    api_key=os.getenv('VERLON_API_KEY'),
)

response = client.chat.completions.create(
    model=os.getenv('VERLON_GATE_ID'),
    messages=[
        {"role": "user", "content": "Hello! Tell me a fun fact about space."}
    ]
)

print('Chat completion successful!')
print('Response:', response.choices[0].message.content)
print('Model:', response.model)
print('Usage:', response.usage)
