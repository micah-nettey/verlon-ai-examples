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

print('Streaming response:')
print('-' * 50)

stream = client.chat.completions.create(
    model=os.getenv('VERLON_GATE_ID'),
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a short story about a robot."}
    ],
    stream=True,
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ''
    print(content, end='', flush=True)

print()
print('-' * 50)
print('Streaming completed!')
