# from fastapi.testclient import TestClient
# from app.core.config import settings
# from app.tests.utils.user import create_random_user
# from app.tests.utils.feedback import create_random_feedback

# def test_create_feedback(
#     client: TestClient, normal_user_token_headers: dict[str, str], db: Session
# ) -> None:
#     user = create_random_user(db)
#     data = {"title": "Test Feedback", "description": "This is a test feedback"}
#     response = client.post(
#         f"{settings.API_V1_STR}/{user.username}/feedback",
#         headers=normal_user_token_headers,
#         json=data,
#     )
#     assert response.status_code == 201
#     content = response.json()
#     assert content["title"] == data["title"]
#     assert content["description"] == data["description"]
#     assert "id" in content
#     assert "created_at" in content

# def test_create_feedback_user_not_found(
#     client: TestClient, normal_user_token_headers: dict[str, str], db: Session
# ) -> None:
#     data = {"title": "Test Feedback", "description": "This is a test feedback"}
#     response = client.post(
#         f"{settings.API_V1_STR}/nonexistent_user/feedback",
#         headers=normal_user_token_headers,
#         json=data,
#     )
#     assert response.status_code == 404
#     content = response.json()
#     assert content["detail"] == "User not found"

# def test_create_feedback_forbidden(
#     client: TestClient, normal_user_token_headers: dict[str, str], db: Session
# ) -> None:
#     user = create_random_user(db)
#     another_user = create_random_user(db)
#     data = {"title": "Test Feedback", "description": "This is a test feedback"}
#     response = client.post(
#         f"{settings.API_V1_STR}/{another_user.username}/feedback",
#         headers=normal_user_token_headers,
#         json=data,
#     )
#     assert response.status_code == 403
#     content = response.json()
#     assert content["detail"] == "Forbidden"

# def test_create_feedback_invalid_data(
#     client: TestClient, normal_user_token_headers: dict[str, str], db: Session
# ) -> None:
#     user = create_random_user(db)
#     data = {"title": "", "description": "This is a test feedback"}
#     response = client.post(
#         f"{settings.API_V1_STR}/{user.username}/feedback",
#         headers=normal_user_token_headers,
#         json=data,
#     )
#     assert response.status_code == 422

# def test_create_feedback_unauthenticated(
#     client: TestClient, db: Session
# ) -> None:
#     user = create_random_user(db)
#     data = {"title": "Test Feedback", "description": "This is a test feedback"}
#     response = client.post(
#         f"{settings.API_V1_STR}/{user.username}/feedback",
#         json=data,
#     )
#     assert response.status_code == 401
#     content = response.json()
#     assert content["detail"] == "Not authenticated"
