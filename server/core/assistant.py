import aiohttp

class Assistant:

    def __init__(self, story_generator):
        self.story_generator = story_generator
        self.api_key = story_generator.api_key   # reuse Mistral key

    # ==============================
    # MAIN FUNCTION
    # ==============================
    async def handle_message(self, user_input: str):

        # -----------------------------
        # PROMPT FOR AI
        # -----------------------------
        prompt = f"""
You are an AI Comic Assistant.

If the user gives a comic idea:
Generate:

1. Title
2. Characters (with short description)
3. Short story (2-3 lines)
4. Style (comic, manga, realistic, etc.)

Return in clean readable format.

If input is unclear:
Ask questions to guide the user.

User:
{user_input}
"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "mistral-small",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.8
                    }
                ) as response:

                    data = await response.json()

                    if "error" in data:
                        raise Exception(data["error"])

                    reply = data["choices"][0]["message"]["content"]

        except Exception as e:
            print("❌ Assistant error:", str(e))
            return {
                "type": "error",
                "message": "Something went wrong with AI."
            }

        # -----------------------------
        # RETURN IDEA (NOT GENERATE)
        # -----------------------------
        return {
            "type": "idea",
            "message": reply.strip()
        }

    # ==============================
    # OPTIONAL GUIDANCE (fallback)
    # ==============================
    def generate_guidance(self, text: str):

        if "start" in text or "create" in text:
            return (
                "Awesome! Let's create a comic 🎉\n"
                "Tell me:\n"
                "1. Genre (Action, Comedy, Romance)\n"
                "2. Main character\n"
                "3. Mood (funny, dark, serious)"
            )

        if "help" in text:
            return (
                "Try something like:\n"
                "'Action comic with funny hero in city'"
            )

        return (
            "Tell me your comic idea!\n"
            "Example:\n"
            "'Action + funny hero + city setting'"
        )