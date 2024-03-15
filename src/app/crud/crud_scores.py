from fastcrud import FastCRUD

from ..models.score import Score
from ..schemas.score import ScoreCreateInternal, ScoreDelete, ScoreUpdate, ScoreUpdateInternal

CRUDScore = FastCRUD[Score, ScoreCreateInternal, ScoreDelete, ScoreUpdate, ScoreUpdateInternal]
crud_scores = CRUDScore(Score)
