from typing import List

class PanelGenerator:

    def split_story(self, story: str, panel_count: int) -> List[str]:
        sentences = [s.strip() for s in story.split(".") if s.strip()]

        if len(sentences) >= panel_count:
            return sentences[:panel_count]

        while len(sentences) < panel_count:
            sentences.append(sentences[-1] if sentences else "Scene continues")

        return sentences