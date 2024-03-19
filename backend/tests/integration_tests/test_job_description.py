from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.logger import logging
from app.main import app

from tests.helper import _get_token
import json

test_name = settings.TEST_NAME
test_username = settings.TEST_USERNAME
test_email = settings.TEST_EMAIL
test_password = settings.TEST_PASSWORD

admin_username = settings.ADMIN_USERNAME
admin_password = settings.ADMIN_PASSWORD

client = TestClient(app)


def test_post_create_job_description_wrong_none_input(client: TestClient) -> None:
    
    token = _get_token(username=admin_username, password=admin_password, client=client)
    data = {
        "title": "Test Job Description",
        "s3_url": "http://test.s3.amazonaws.com/test.pdf",
        "description": None,
        "pdf_file": None
    }

    response = client.post(
        f"/api/v1/{admin_username}/job_description",
        json=data,
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )

    logging.info(response.json())

    assert response.status_code == 400


# def test_post_create_job_description_wrong_input(client: TestClient) -> None:
    
#     token = _get_token(username=admin_username, password=admin_password, client=client)
#     data = {
#         "title": "Test Job Description",
#         "s3_url": "http://test.s3.amazonaws.com/test.pdf",
#         "description": "Test",
#         "pdf_file": b"test"
#     }

#     response = client.post(
#         f"/api/v1/{admin_username}/job_description",
#         json=data,
#         headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
#     )

#     logging.info(response.json())
    

# def test_post_create_job_description(client: TestClient) -> None:
#     token = _get_token(username=admin_username, password=admin_password, client=client)

#     data = {
#         "title": "Test Job Description",
#         "description": None,
#         "s3_url": "http://test.s3.amazonaws.com/test.pdf",
#         "pdf_file": None
#     }

#     response = client.post(
#         f"/api/v1/{admin_username}/job_description",
#         json=data,
#         headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
#     )

#     logging.info(response.json())
#     content = response.json()

#     assert 1 == 1

#     assert response.status_code == 400

