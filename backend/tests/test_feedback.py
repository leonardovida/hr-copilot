from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.logger import logging
from app.main import app

from .helper import _get_token

test_name = settings.TEST_NAME
test_username = settings.TEST_USERNAME
test_email = settings.TEST_EMAIL
test_password = settings.TEST_PASSWORD

admin_username = settings.ADMIN_USERNAME
admin_password = settings.ADMIN_PASSWORD

client = TestClient(app)


def test_create_feedback(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)
    data = {"title": "Test Feedback", "description": "This is a test feedback"}
    response = client.post(
        f"/api/v1/{admin_username}/feedback",
        json=data,
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )
    logging.info(response.json())
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert "id" in content
    assert "created_at" in content


def test_create_feedback_user_not_found(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)
    data = {"title": "Test Feedback", "description": "This is a test feedback"}
    response = client.post(
        "/api/v1/nonexistent_user/feedback",
        json=data,
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "User not found"


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
