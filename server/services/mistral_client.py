import os
import aiohttp


class MistralClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.mistral.ai/v1/chat/completions"
        self._session = None

    async def _get_session(self):
        if self._session is None:
            self._session = aiohttp.ClientSession()
        return self._session

    async def generate_text(self, prompt: str):
        try:
            session = await self._get_session()

            async with session.post(
                self.endpoint,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistral-small",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7
                }
            ) as response:

                if response.status == 200:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]

                else:
                    error = await response.text()
                    print("Mistral error:", error)
                    return prompt  # fallback

        except Exception as e:
            print("Mistral exception:", str(e))
            return prompt

    async def check_health(self):
        try:
            result = await self.generate_text("Hello")
            return True, "healthy"
        except Exception as e:
            return False, str(e)

    async def close(self):
        if self._session:
            await self._session.close()
            self._session = None