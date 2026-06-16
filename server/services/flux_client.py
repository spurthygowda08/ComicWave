import aiohttp
import base64
import urllib.parse
import random

class FluxClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key  # kept for compatibility

    # ==============================
    # GENERATE IMAGE (POLLINATIONS)
    # ==============================
    async def generate_image(self, prompt: str, width: int = 512, height: int = 512):
        try:
            # 🔥 Random seed for variation
            seed = random.randint(1, 999999)

            # 🔥 Enhance prompt (better visuals)
            enhanced_prompt = f"""
{prompt}

comic book panel, black and white manga style,
high contrast, dramatic lighting,
expressive characters, cinematic composition,
ultra detailed, sharp lines
"""

            # ✅ Encode prompt
            encoded_prompt = urllib.parse.quote(enhanced_prompt.strip())

            # ✅ Correct Pollinations endpoint
            url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&seed={seed}"

            print("📡 Generating image (Pollinations)...")

            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:

                    if response.status == 200:
                        image_bytes = await response.read()

                        base64_str = base64.b64encode(image_bytes).decode("utf-8")

                        print("✅ Image generated successfully")

                        return f"data:image/jpeg;base64,{base64_str}"

                    else:
                        print("❌ Image API failed:", response.status)
                        return self._fallback_image()

        except Exception as e:
            print("❌ Image generation error:", str(e))
            return self._fallback_image()

    # ==============================
    # FALLBACK IMAGE (NEVER FAIL)
    # ==============================
    def _fallback_image(self):
        return "https://via.placeholder.com/512?text=Image+Unavailable"

    async def close(self):
        pass