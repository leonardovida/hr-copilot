# Local development

## Project structure

The project is structured as follows

```bash
tree . -d -L 2 # from the root of the repository
```

```bash
talent_copilot
├── backend
│   ├── __pycache__
│   ├── dev # This holds the docker-compose files for development
│   └── talent_copilot # This is the main package for the backend
├── docs
│   └── adr # The architecture decision records
├── frontend
│   ├── app # The main application
│   ├── components # Reusable components
│   ├── lib # Reusable functions
│   ├── node_modules
│   └── public
└── terraform # Terraform configuration for the project
```

## Frontend

### Next.js UI

#### System Requirements

- [Node.js 18.17](https://nodejs.org/en) or later.

#### Running Locally

To run the development server we recommend using `bun`. Once installed you can simply:

```bash
cd frontend
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the next.js app running locally. But this is not all! This app uses FastAPI as backend, so not everything is in the typescript app. This is motivated by our willigness to later provide a performant API for the businesses that want to use our app and directly attach to us via our API.

## Backend

To startup the backend we assume you will be using the docker-compose files provided in the `deploy` folder.

### Pre-commit

In this project we use pre-commit. This is a tool to insure consistent formatting and styling to our code across developers. To install pre-commit simply run inside the shell:

```bash
pre-commit install
```

This will make sure that each commit is formatted and styled correctly.

### Environment Variables (.env)

Then create a `.env` file inside `backend` directory.

```sh
touch .env
```

Inside of `.env`, please copy and past all the variables present in the env-example variables:

- App settings represent internal settings like the environment (`LOCAL` in this case) and descriptions
- For the database \[`if you don't have a database yet, we recommend Neon`\](neon console), after having created the databse remotely or locally add the required environment variables as follows

```
# ------------- database -------------
POSTGRES_USER="your_postgres_user"
POSTGRES_PASSWORD="your_password"
POSTGRES_SERVER="your_server" # default "localhost", if using docker compose you should use "db"
POSTGRES_PORT=5432 # default "5432", if using docker compose you should use "5432"
POSTGRES_DB="your_db"
```

- For database administration using PGAdmin create the following variables in the .env file

```
# ------------- pgadmin -------------
PGADMIN_DEFAULT_EMAIL="your_email_address"
PGADMIN_DEFAULT_PASSWORD="your_password"
PGADMIN_LISTEN_PORT=80
```

To connect to the database, log into the PGAdmin console with the values specified in `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`.

Once in the main PGAdmin screen, click Add Server:

1. Hostname/address is `db` (if using containers)
1. Is the value you specified in `POSTGRES_PORT`
1. Leave this value as `postgres`
1. is the value you specified in `POSTGRES_USER`
1. Is the value you specified in `POSTGRES_PASSWORD`

For crypt:
Start by running

```sh
openssl rand -hex 32
```

And then create in `.env`:

```
# ------------- crypt -------------
SECRET_KEY= # result of openssl rand -hex 32
ALGORITHM= # pick an algorithm, default HS256
ACCESS_TOKEN_EXPIRE_MINUTES= # minutes until token expires, default 30
REFRESH_TOKEN_EXPIRE_DAYS= # days until token expires, default 7
```

Then for the first admin user:

```
# ------------- admin -------------
ADMIN_NAME="your_name"
ADMIN_EMAIL="your_email"
ADMIN_USERNAME="your_username"
ADMIN_PASSWORD="your_password"
```

For redis caching:

```
# ------------- redis cache-------------
REDIS_CACHE_HOST="your_host" # default "localhost", if using docker compose you should use "redis"
REDIS_CACHE_PORT=6379 # default "6379", if using docker compose you should use "6379"
```

And for client-side caching:

```
# ------------- redis client-side cache -------------
CLIENT_CACHE_MAX_AGE=30 # default "30"
```

For ARQ Job Queues:

```
# ------------- redis queue -------------
REDIS_QUEUE_HOST="your_host" # default "localhost", if using docker compose you should use "redis"
REDIS_QUEUE_PORT=6379 # default "6379", if using docker compose you should use "6379"
```

> \[!WARNING\]
> You may use the same redis for both caching and queue while developing, but the recommendation is using two separate containers for production.

To create the first tier:

```
# ------------- first tier -------------
TIER_NAME="free"
```

For the rate limiter:

```
# ------------- redis rate limit -------------
REDIS_RATE_LIMIT_HOST="localhost"   # default="localhost", if using docker compose you should use "redis"
REDIS_RATE_LIMIT_PORT=6379          # default=6379, if using docker compose you should use "6379"


# ------------- default rate limit settings -------------
DEFAULT_RATE_LIMIT_LIMIT=10         # default=10
DEFAULT_RATE_LIMIT_PERIOD=3600      # default=3600
```

For tests (optional to run):

```
# ------------- test -------------
TEST_NAME="Tester User"
TEST_EMAIL="test@tester.com"
TEST_USERNAME="testeruser"
TEST_PASSWORD="Str1ng$t"
```

And Finally the environment:

```
# ------------- environment -------------
ENVIRONMENT="local"
```

`ENVIRONMENT` can be one of `local`, `staging` and `production`, defaults to local, and changes the behavior of api `docs` endpoints:

- **local:** `/docs`, `/redoc` and `/openapi.json` available
- **staging:** `/docs`, `/redoc` and `/openapi.json` available for superusers
- **production:** `/docs`, `/redoc` and `/openapi.json` not available

## Database

### Alembic Migrations

While in the `backend` folder, run Alembic migrations:

```sh
poetry run alembic revision --autogenerate
```

And to apply the migration

```sh
poetry run alembic upgrade head
```

### Database operations thanks to `fastcrud`

#### Get Multi

To get a list of objects with the attributes, you should use the get_multi:

```python
# Here I'm getting at most 10 users with the name 'User Userson' except for the first 3
user = await crud_users.get_multi(db=db, offset=3, limit=100, name="User Userson")
```

> \[!WARNING\]
> Note that get_multi returns a python `dict`.

Which will return a python dict with the following structure:

```javascript
{
  "data": [
    {
      "id": 4,
      "name": "User Userson",
      "username": "userson4",
      "email": "user.userson4@example.com",
      "profile_image_url": "https://profileimageurl.com"
    },
    {
      "id": 5,
      "name": "User Userson",
      "username": "userson5",
      "email": "user.userson5@example.com",
      "profile_image_url": "https://profileimageurl.com"
    }
  ],
  "total_count": 2,
  "has_more": false,
  "page": 1,
  "items_per_page": 10
}
```

#### Delete

To delete we have two options:

- db_delete: actually deletes the row from the database
- delete:
  - adds `"is_deleted": True` and `deleted_at: datetime.now(UTC)` if the model inherits from `PersistentDeletion` (performs a soft delete), but keeps the object in the database.
  - actually deletes the row from the database if the model does not inherit from `PersistentDeletion`

```python
# Here I'll just change is_deleted to True
crud_users.delete(db=db, username="myusername")

# Here I actually delete it from the database
crud_users.db_delete(db=db, username="myusername")
```

#### Get Joined

To retrieve data with a join operation, you can use the get_joined method from your CRUD module. Here's how to do it:

```python
# Fetch a single record with a join on another model (e.g., User and Tier).
result = await crud_users.get_joined(
    db=db,  # The SQLAlchemy async session.
    join_model=Tier,  # The model to join with (e.g., Tier).
    schema_to_select=UserSchema,  # Pydantic schema for selecting User model columns (optional).
    join_schema_to_select=TierSchema,  # Pydantic schema for selecting Tier model columns (optional).
)
```

**Relevant Parameters:**

- `join_model`: The model you want to join with (e.g., Tier).
- `join_prefix`: Optional prefix to be added to all columns of the joined model. If None, no prefix is added.
- `join_on`: SQLAlchemy Join object for specifying the ON clause of the join. If None, the join condition is auto-detected based on foreign keys.
- `schema_to_select`: A Pydantic schema to select specific columns from the primary model (e.g., UserSchema).
- `join_schema_to_select`: A Pydantic schema to select specific columns from the joined model (e.g., TierSchema).
- `join_type`: pecifies the type of join operation to perform. Can be "left" for a left outer join or "inner" for an inner join. Default "left".
- `kwargs`: Filters to apply to the primary query.

This method allows you to perform a join operation, selecting columns from both models, and retrieve a single record.

#### Get Multi Joined

Similarly, to retrieve multiple records with a join operation, you can use the get_multi_joined method. Here's how:

```python
# Retrieve a list of objects with a join on another model (e.g., User and Tier).
result = await crud_users.get_multi_joined(
    db=db,  # The SQLAlchemy async session.
    join_model=Tier,  # The model to join with (e.g., Tier).
    join_prefix="tier_",  # Optional prefix for joined model columns.
    join_on=and_(User.tier_id == Tier.id, User.is_superuser == True),  # Custom join condition.
    schema_to_select=UserSchema,  # Pydantic schema for selecting User model columns.
    join_schema_to_select=TierSchema,  # Pydantic schema for selecting Tier model columns.
    username="john_doe",  # Additional filter parameters.
)
```

**Relevant Parameters:**

- `join_model`: The model you want to join with (e.g., Tier).
- `join_prefix`: Optional prefix to be added to all columns of the joined model. If None, no prefix is added.
- `join_on`: SQLAlchemy Join object for specifying the ON clause of the join. If None, the join condition is auto-detected based on foreign keys.
- `schema_to_select`: A Pydantic schema to select specific columns from the primary model (e.g., UserSchema).
- `join_schema_to_select`: A Pydantic schema to select specific columns from the joined model (e.g., TierSchema).
- `join_type`: pecifies the type of join operation to perform. Can be "left" for a left outer join or "inner" for an inner join. Default "left".
- `kwargs`: Filters to apply to the primary query.
- `offset`: The offset (number of records to skip) for pagination. Default 0.
- `limit`: The limit (maximum number of records to return) for pagination. Default 100.
- `kwargs`: Filters to apply to the primary query.

#### More Efficient Selecting

For the `get` and `get_multi` methods we have the option to define a `schema_to_select` attribute, which is what actually makes the queries more efficient. When you pass a `pydantic schema` (preferred) or a list of the names of the attributes in `schema_to_select` to the `get` or `get_multi` methods, only the attributes in the schema will be selected.

```python
from app.schemas.user import UserRead

# Here it's selecting all of the user's data
crud_user.get(db=db, username="myusername")

# Now it's only selecting the data that is in UserRead.
# Since that's my response_model, it's all I need
crud_user.get(db=db, username="myusername", schema_to_select=UserRead)
```

### Caching

The `cache` decorator allows you to cache the results of FastAPI endpoint functions, enhancing response times and reducing the load on your application by storing and retrieving data in a cache.

Caching the response of an endpoint is really simple, just apply the `cache` decorator to the endpoint function.

> \[!WARNING\]
> Note that you should always pass request as a variable to your endpoint function if you plan to use the cache decorator.

```python
...
from app.core.utils.cache import cache


@app.get("/sample/{my_id}")
@cache(key_prefix="sample_data", expiration=3600, resource_id_name="my_id")
async def sample_endpoint(request: Request, my_id: int):
    # Endpoint logic here
    return {"data": "my_data"}
```

The way it works is:

- the data is saved in redis with the following cache key: `sample_data:{my_id}`
- then the time to expire is set as 3600 seconds (that's the default)

Another option is not passing the `resource_id_name`, but passing the `resource_id_type` (default int):

```python
...
from app.core.utils.cache import cache


@app.get("/sample/{my_id}")
@cache(key_prefix="sample_data", resource_id_type=int)
async def sample_endpoint(request: Request, my_id: int):
    # Endpoint logic here
    return {"data": "my_data"}
```

In this case, what will happen is:

- the `resource_id` will be inferred from the keyword arguments (`my_id` in this case)
- the data is saved in redis with the following cache key: `sample_data:{my_id}`
- then the the time to expire is set as 3600 seconds (that's the default)

Passing resource_id_name is usually preferred.

## ARQ Job Queues

Create the background task in `app/core/worker/functions.py`:

```python
...
# -------- background tasks --------
async def sample_background_task(ctx, name: str) -> str:
    await asyncio.sleep(5)
    return f"Task {name} is complete!"
```

Then add the function to the `WorkerSettings` class `functions` variable in `app/core/worker/settings.py`:

```python
# -------- class --------
...


class WorkerSettings:
    functions = [sample_background_task]
    ...
```

Add the task to be enqueued in a **POST** endpoint and get the info in a **GET**:

```python
...


@router.post("/task", response_model=Job, status_code=201)
async def create_task(message: str):
    job = await queue.pool.enqueue_job("sample_background_task", message)
    return {"id": job.job_id}


@router.get("/task/{task_id}")
async def get_task(task_id: str):
    job = ArqJob(task_id, queue.pool)
    return await job.info()
```

And finally run the worker in parallel to your fastapi application.

If you are using `docker compose`, the worker is already running.
If you are doing it from scratch, run while in the `root` folder:

```sh
poetry run arq backend.app.core.worker.settings.WorkerSettings
```

## Rate Limiting

To limit how many times a user can make a request in a certain interval of time (very useful to create subscription plans or just to protect your API against DDOS), you may just use the `rate_limiter` dependency:

```python
from fastapi import Depends

from app.api.dependencies import rate_limiter
from app.core.utils import queue
from app.schemas.job import Job


@router.post("/task", response_model=Job, status_code=201, dependencies=[Depends(rate_limiter)])
async def create_task(message: str):
    job = await queue.pool.enqueue_job("sample_background_task", message)
    return {"id": job.job_id}
```

By default, if no token is passed in the header (that is - the user is not authenticated), the user will be limited by his IP address with the default `limit` (how many times the user can make this request every period) and `period` (time in seconds) defined in `.env`.

Even though this is useful, real power comes from creating `tiers` (categories of users) and standard `rate_limits` (`limits` and `periods` defined for specific `paths` - that is - endpoints) for these tiers.

All of the `tier` and `rate_limit` models, schemas, and endpoints are already created in the respective folders (and usable only by superusers). You may use the `create_tier` script to create the first tier (it uses the `.env` variable `TIER_NAME`, which is all you need to create a tier) or just use the api:

Then I'll associate a `rate_limit` for the path `api/v1/tasks/task` for each of them, I'll associate a `rate limit` for the path `api/v1/tasks/task`.

> \[!WARNING\]
> Do not forget to add `api/v1/...` or any other prefix to the beggining of your path. For the structure of the boilerplate, `api/v1/<rest_of_the_path>`

1 request every hour (3600 seconds) for the free tier:

10 requests every hour for the pro tier:

Now let's read all the tiers available (`GET api/v1/tiers`):

```javascript
{
  "data": [
    {
      "name": "free",
      "id": 1,
      "created_at": "2023-11-11T05:57:25.420360"
    },
    {
      "name": "pro",
      "id": 2,
      "created_at": "2023-11-12T00:40:00.759847"
    }
  ],
  "total_count": 2,
  "has_more": false,
  "page": 1,
  "items_per_page": 10
}
```

And read the `rate_limits` for the `pro` tier to ensure it's working (`GET api/v1/tier/pro/rate_limits`):

```javascript
{
  "data": [
    {
      "path": "api_v1_tasks_task",
      "limit": 10,
      "period": 3600,
      "id": 1,
      "tier_id": 2,
      "name": "api_v1_tasks:10:3600"
    }
  ],
  "total_count": 1,
  "has_more": false,
  "page": 1,
  "items_per_page": 10
}
```

Now, whenever an authenticated user makes a `POST` request to the `api/v1/tasks/task`, they'll use the quota that is defined by their tier.
You may check this getting the token from the `api/v1/login` endpoint, then passing it in the request header:

```sh
curl -X POST 'http://127.0.0.1:8000/api/v1/tasks/task?message=test' \
-H 'Authorization: Bearer <your-token-here>'
```

> \[!TIP\]
> Since the `rate_limiter` dependency uses the `get_optional_user` dependency instead of `get_current_user`, it will not require authentication to be used, but will behave accordingly if the user is authenticated (and token is passed in header). If you want to ensure authentication, also use `get_current_user` if you need.

To change a user's tier, you may just use the `PATCH api/v1/user/{username}/tier` endpoint.
Note that for flexibility (since this is a boilerplate), it's not necessary to previously inform a tier_id to create a user, but you probably should set every user to a certain tier (let's say `free`) once they are created.

> \[!WARNING\]
> If a user does not have a `tier` or the tier does not have a defined `rate limit` for the path and the token is still passed to the request, the default `limit` and `period` will be used, this will be saved in `app/logs`.

### 5.12 JWT Authentication

#### 5.12.1 Details

The JWT in this boilerplate is created in the following way:

1. **JWT Access Tokens:** how you actually access protected resources is passing this token in the request header.
1. **Refresh Tokens:** you use this type of token to get an `access token`, which you'll use to access protected resources.

The `access token` is short lived (default 30 minutes) to reduce the damage of a potential leak. The `refresh token`, on the other hand, is long lived (default 7 days), and you use it to renew your `access token` without the need to provide username and password every time it expires.

Since the `refresh token` lasts for a longer time, it's stored as a cookie in a secure way:

```python
# app/api/v1/login

...
response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,  # Prevent access through JavaScript
    secure=True,  # Ensure cookie is sent over HTTPS only
    samesite="Lax",  # Default to Lax for reasonable balance between security and usability
    max_age=number_of_seconds,  # Set a max age for the cookie
)
...
```

You may change it to suit your needs. The possible options for `samesite` are:

- `Lax`: Cookies will be sent in top-level navigations (like clicking on a link to go to another site), but not in API requests or images loaded from other sites.
- `Strict`: Cookies will be sent in top-level navigations (like clicking on a link to go to another site), but not in API requests or images loaded from other sites.
- `None`: Cookies will be sent with both same-site and cross-site requests.

#### 5.12.2 Usage

What you should do with the client is:

- `Login`: Send credentials to `/api/v1/login`. Store the returned access token in memory for subsequent requests.
- `Accessing Protected Routes`: Include the access token in the Authorization header.
- `Token Renewal`: On access token expiry, the front end should automatically call `/api/v1/refresh` for a new token.
- `Login Again`: If refresh token is expired, credentials should be sent to `/api/v1/login` again, storing the new access token in memory.
- `Logout`: Call /api/v1/logout to end the session securely.

This authentication setup in the provides a robust, secure, and user-friendly way to handle user sessions in your API applications.

### 5.13 Running

If you are using docker compose, just running the following command should ensure everything is working:

```sh
docker compose up
```

If you are doing it from scratch, ensure your postgres and your redis are running, then
while in the `root` folder, run to start the application with uvicorn server:

```sh
poetry run uvicorn backend.app.main:app --reload
```

And for the worker:

```sh
poetry run arq backend.app.core.worker.settings.WorkerSettings
```
