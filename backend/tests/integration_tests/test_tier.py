from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
import datetime
import logging

from tests.helper import _get_token


test_name = settings.TEST_NAME
test_username = settings.TEST_USERNAME
test_email = settings.TEST_EMAIL
test_password = settings.TEST_PASSWORD

admin_username = settings.ADMIN_USERNAME
admin_password = settings.ADMIN_PASSWORD

client = TestClient(app)


def test_post_tier(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)

    response = client.post(
        "/api/v1/tier",
        json={"name": "test"},
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )

    logging.info(response.json())
    assert response.status_code == 201


def test_get_tier(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)
    tier_name = "test"
    response = client.get(
        f"/api/v1/tier/{tier_name}",
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )

    logging.info(response.json())
    assert response.status_code == 200
    assert response.json()["name"] == tier_name


def test_get_tiers(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)

    response = client.get(
        "/api/v1/tiers",
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )

    logging.info(response.json())
    assert response.status_code == 200


def test_patch_tiers(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)

    tier_name = "test"
    response = client.patch(
        f"/api/v1/tier/{tier_name}",
        json={"name": "test2"},
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )

    logging.info(response.json())
    assert response.status_code == 200

def test_delete_tiers(client: TestClient) -> None:
    token = _get_token(username=admin_username, password=admin_password, client=client)

    tier_name = "test2"
    response = client.delete(
        f"/api/v1/tier/{tier_name}",
        headers={"Authorization": f'Bearer {token.json()["access_token"]}'},
    )

    logging.info(response.json())
    assert response.status_code == 200



