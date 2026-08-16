from dataclasses import dataclass, field


@dataclass
class Personality:
    """Defines who the agent is: role, tone, boundaries.

    Kept as a plain, serializable value object so it can be built directly
    from the `personalities` DB row or from an API payload.
    """

    name: str
    role: str
    system_prompt: str
    traits: dict = field(default_factory=dict)

    def as_system_message(self) -> str:
        trait_lines = "\n".join(f"- {key}: {value}" for key, value in self.traits.items())
        return (
            f"You are {self.name}, acting strictly in the role of {self.role}.\n\n"
            f"{self.system_prompt}\n\n"
            + (f"Personality traits:\n{trait_lines}\n\n" if trait_lines else "")
            + "Rules:\n"
            "- Always stay fully in character. Never break persona, never mention being an AI language model.\n"
            "- Never drift into topics or a tone outside this defined personality; no unrelated 'extra' conversation.\n"
            "- Be verbose, engaged, and articulate -- give substantive, well-developed responses rather than terse ones.\n"
        )

    def describe(self) -> str:
        return f"{self.name} ({self.role}): {self.system_prompt}"
