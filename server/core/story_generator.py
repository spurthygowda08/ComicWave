from typing import List, Dict
import json
import aiohttp
import re


class StoryGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        print("✅ Mistral Connected (Cinematic Mode)")

    # ==============================
    # MAIN FUNCTION
    # ==============================
    async def generate_comic(self, story: str, characters: str, panel_count: int, style="manga"):

        panels = await self._generate_panels(story, characters, panel_count)

        prompts = self._generate_image_prompts(
            panels, characters, style
        )

        return {
            "panels": [
                {
                    "panel_number": i + 1,
                    "scene": panels[i]["scene"],
                    "caption": panels[i]["caption"],
                    "dialogue": panels[i]["dialogue"],
                    "image_prompt": prompts[i]
                }
                for i in range(len(panels))
            ]
        }

    # ==============================
    # PANEL GENERATION (MISTRAL)
    # ==============================
    async def _generate_panels(self, story, characters, count):

        prompt = f"""
You are a PROFESSIONAL COMIC WRITER.

Create EXACTLY {count} comic panels.

STRICT RULES:
- Make scenes cinematic and visual
- Characters MUST interact
- Dialogue must be emotional and realistic
- Caption should describe mood, not repeat scene
- Each panel should feel like a movie moment

OUTPUT STRICT JSON ONLY:

{{
  "panels": [
    {{
      "scene": "detailed visual scene",
      "caption": "emotional narration",
      "dialogue": "natural character dialogue"
    }}
  ]
}}

Story:
{story}

Characters:
{characters}
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
                        "temperature": 0.9,
                        "response_format": {"type": "json_object"}
                    }
                ) as response:

                    data = await response.json()

                    if "error" in data:
                        print("❌ Mistral Error:", data)
                        raise Exception("Mistral failed")

                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)

                    return parsed["panels"]

        except Exception as e:
            print("⚠️ Fallback triggered:", str(e))
            return self._fallback(story, count)

    # ==============================
    # IMAGE PROMPT GENERATION 🔥
    # ==============================
    def _generate_image_prompts(self, panels, characters, style):

        prompts = []

        for i, p in enumerate(panels):

            prompt = f"""
{style} style, cinematic lighting, ultra detailed

Characters:
{characters}

Scene:
{p['scene']}

Dialogue:
{p['dialogue']}

Caption:
{p['caption']}

IMPORTANT:
- Show strong facial expressions
- Match emotion from dialogue
- Match mood from caption
- Dramatic composition
- High quality artwork

Panel {i+1}
"""

            prompts.append(prompt.strip())

        return prompts

    # ==============================
    # FALLBACK
    # ==============================
    def _fallback(self, story, count):
        parts = re.split(r'[.!?]', story)
        parts = [p.strip() for p in parts if p.strip()]

        while len(parts) < count:
            parts.append(parts[-1] if parts else "Scene")

        return [
            {"scene": p, "caption": p, "dialogue": p}
            for p in parts[:count]
        ]