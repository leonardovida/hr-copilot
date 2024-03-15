from pydantic import BaseModel, Field, field_validator


class Skill(BaseModel):
    name: str
    description: str
    long_description: str
    skill_categories: list[str]


class Skills(BaseModel):
    hard_skills: dict[str, Skill] | None = Field(default_factory=dict)
    soft_skills: dict[str, Skill] | None = Field(default_factory=dict)


class SkillsExtract(BaseModel):
    required_skills: Skills
    nice_to_have_skills: Skills

    @field_validator("required_skills")
    @classmethod
    def validate_required(cls, v):
        if {} == v:
            raise ValueError("Required skills cannot be empty.")
        return v
