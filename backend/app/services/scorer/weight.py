from ...core.config import settings


class ScoreWeight:
    """The Score Weight Definition."""

    # Match weight
    _yes_match_weight: float = settings.YES_MATCH_WEIGHT
    _partial_match_weight: float = settings.PARTIAL_MATCH_WEIGHT
    _no_match_weight: float = settings.NO_MATCH_WEIGHT

    # Required and Nice to have Skills weight
    _required_skills_weight: float = settings.REQUIRED_SKILLS_WEIGHT
    _nice_to_have_skills_weight: float = settings.NICE_TO_HAVE_SKILLS_WEIGHT

    # Hard and Soft skills weights
    _hard_skills_weights: float = settings.HARD_SKILLS_WEIGHT
    _soft_skills_weights: float = settings.SOFT_SKILLS_WEIGHT

    def get_yes_match_weight(self) -> float:
        return self._yes_match_weight

    def get_partial_match_weight(self) -> float:
        return self._partial_match_weight

    def get_no_match_weight(self) -> float:
        return self._no_match_weight

    def get_required_skills_weight(self) -> float:
        return self._required_skills_weight

    def get_nice_to_have_skills_weight(self) -> float:
        return self._nice_to_have_skills_weight

    def get_hard_skills_weights(self) -> float:
        return self._hard_skills_weights

    def get_soft_skills_weights(self) -> float:
        return self._soft_skills_weights
