import json
import random
from pathlib import Path
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

from services.mistral_client import MistralClient


class UniverseGenerator:
    """Générateur pour les univers alternatifs."""

    def __init__(self, mistral_client: MistralClient):
        self.mistral_client = mistral_client
        self.styles_data = self._load_universe_styles()

    def _create_prompt(self, hero, genre, epoch):

        system_template = """You are a creative writing assistant specialized in comic book universes."""

        human_template = f"""
- main character: {hero}
- Genre: {genre}
- Historical epoch: {epoch}

Describe the first segment of the story in 30 words.
Where is the main character, what is he doing?
He must do something banal.
Add a small strange twist at the end.
"""

        return system_template + "\n" + human_template

    def _load_universe_styles(self):
        try:
            current_dir = Path(__file__).parent.parent
            styles_path = current_dir / "styles" / "universe_styles.json"

            if not styles_path.exists():
                raise FileNotFoundError(f"Universe styles file not found at {styles_path}")

            with open(styles_path, "r", encoding="utf-8") as f:
                return json.load(f)

        except Exception as e:
            raise ValueError(f"Failed to load universe styles: {str(e)}")

    def _get_random_elements(self):
        style = random.choice(self.styles_data["styles"])
        genre = random.choice(self.styles_data["genres"])
        epoch = random.choice(self.styles_data["epochs"])
        macguffin = random.choice(self.styles_data["macguffins"])
        hero_full = random.choice(self.styles_data["hero"])

        artist_ref = random.choice(style["references"])
        artist = artist_ref["artist"]
        works = ", ".join(artist_ref["works"])

        hero_name = hero_full.split(",")[0].strip()
        hero_desc = hero_full.strip()

        return style, genre, epoch, macguffin, hero_name, hero_desc, artist, works

    async def generate(self):
        """Generate a new universe."""

        style, genre, epoch, macguffin, hero_name, hero_desc, artist, works = self._get_random_elements()

        prompt = self._create_prompt(hero_name, genre, epoch)

        # ✅ FIX: use correct method
        response = await self.mistral_client.generate_text(prompt)

        return response, style, genre, epoch, macguffin, hero_name, hero_desc