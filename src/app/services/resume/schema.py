from pydantic import BaseModel, Field, field_validator


class EvaluationSkill(BaseModel):
    name: str
    match: str
    content_match: str
    reasoning: str


class EvaluationSkills(BaseModel):
    hard_skills: dict[str, EvaluationSkill] | None = Field(default_factory=dict)
    soft_skills: dict[str, EvaluationSkill] | None = Field(default_factory=dict)


class EvaluationExtract(BaseModel):
    required_skills: EvaluationSkills
    nice_to_have_skills: EvaluationSkills

    @field_validator("required_skills")
    @classmethod
    def validate_required(cls, v):
        if {} == v:
            raise ValueError("Required skills cannot be empty.")
        return v
