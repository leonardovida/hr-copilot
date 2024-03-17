from ...schemas.parsed_resume import ParsedResumeRead
from .weight import ScoreWeight


class ScoreError(Exception):
    """Exception raised when a Score cannot be calculated."""


def calc_skill_matches(skills: list[dict], skill_type: str) -> int:
    """Calculate the match score for skills. :param skills: List of skills and their matches. :param skill_type:
    Type of skills (hard_skills or soft_skills).

    :param skills: Dictionary of skills and their matches.
    :param skill_type: Type of skills (hard_skills or soft_skills).
    :return float: The calculated match score.
    """
    weight = ScoreWeight()
    skill_match_score: float = 0.0

    # Weights
    yes_match_weight: float = weight.get_yes_match_weight()
    partial_match_weight: float = weight.get_partial_match_weight()
    no_match_weight: float = weight.get_no_match_weight()

    if skills[skill_type]:
        for skill in skills[skill_type]:
            if skills[skill_type][skill]["match"] == "NO":
                skill_match_score += no_match_weight
            elif skills[skill_type][skill]["match"] == "PARTIAL":
                skill_match_score += partial_match_weight
            elif skills[skill_type][skill]["match"] == "YES":
                skill_match_score += yes_match_weight

    return skill_match_score


async def score_calculation(parsed_resume: ParsedResumeRead) -> float:
    """Calculate the Score using job description and CV matches.

    This score uses the Weighted Arithmetic Mean method. More details:
    https://en.wikipedia.org/wiki/Weighted_arithmetic_mean

    :param parsed_resume: Parsed text containing job description and CV matches.
    :return dict: A dictionary containing the calculated score.
    :raises ScoreError: Exception raised when a score cannot be calculated.
    """
    weight = ScoreWeight()
    # TODO: check these were list(dict)
    # Get skills from parsed_resume
    required_skills: dict = parsed_resume.parsed_skills["required_skills"]
    nice_to_have_skills: dict = parsed_resume.parsed_skills["nice_to_have_skills"]

    # Defining weights
    required_skills_weight: float = weight.get_required_skills_weight()
    nice_to_have_skills_weight: float = weight.get_nice_to_have_skills_weight()

    # Calc total for each skill/type
    total_required_hard_skills: int = len(required_skills.get("hard_skills", []))
    total_required_soft_skills: int = len(required_skills.get("soft_skills", []))
    total_nice_to_have_hard_skills: int = len(nice_to_have_skills.get("hard_skills", []))
    total_nice_to_have_soft_skills: int = len(nice_to_have_skills.get("soft_skills", []))

    structured_skills = [
        (
            total_required_hard_skills,
            required_skills,
            "hard_skills",
            required_skills_weight,
        ),
        (
            total_required_soft_skills,
            required_skills,
            "soft_skills",
            required_skills_weight,
        ),
        (
            total_nice_to_have_hard_skills,
            nice_to_have_skills,
            "hard_skills",
            nice_to_have_skills_weight,
        ),
        (
            total_nice_to_have_soft_skills,
            nice_to_have_skills,
            "soft_skills",
            nice_to_have_skills_weight,
        ),
    ]

    # Aux var to store final result
    result_x: float = 0
    result_y: float = 0

    for total, skills, skill_type, weight in structured_skills:
        if total > 0:
            result_x += calc_skill_matches(skills, skill_type) * weight
            result_y += total * weight

    score = result_x / result_y if result_y > 0 else 0

    if score >= 0:
        return score
    else:
        raise ScoreError("Exception raised when a Score cannot be calculated")
