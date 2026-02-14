import httpx
import asyncio
import os
import sys
from dotenv import load_dotenv

# Set encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

async def test_grok():
    api_key = os.getenv("XAI_API_KEY")
    model = "grok-4-1-fast-non-reasoning"
    
    print(f"Testing Grok with key: {api_key[:10]}...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Hello! Say 'Grok is active' if you can hear me."}
                    ],
                    "temperature": 0.0
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                print("SUCCESS: Grok API Success!")
                print(f"Response: {response.json()['choices'][0]['message']['content']}")
            else:
                print(f"ERROR: Grok API Error: {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"FAILED: Request Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_grok())
