from fastcrud import FastCRUD

from ..models.feedback import Feedback
from ..schemas.feedback import FeedbackCreate, FeedbackDelete, FeedbackUpdate, FeedbackUpdateInternal

CRUDFeedback = FastCRUD[Feedback, FeedbackCreate, FeedbackUpdate, FeedbackUpdateInternal, FeedbackDelete]
crud_feedback = CRUDFeedback(Feedback)
