# Guide deployment

> \[!WARNING\]
> This repository is in a work in progress state and things might and will change.

As you might have noticed, there are multiple ways to deploy this project. This happens frequently as there are infinite ways to deploy a project. This means that the options chones and explained below are by no means the "best" or "only" options available to deploy this. One might argue [Heroku](https://heroku.com/) or [Vultur](https://www.vultr.com/products/cloud-compute/) are better and cheaper, [Railway](https://railway.app/) and [Render](https://render.com/) are more modern and efficient, heck even a full Typescript project might have been better (but definitely not [cheaper](https://twitter.com/shoeboxdnb/status/1643639119824801793) - see Twitter for astronomical bills) leveraging their serveless offering. We don't want to argue, but rather we are offering some choice that we though might help you.

The choices we provide to deploy the backend are the following:

1. Fly.io: this is an easy way to deploy this project in a fully serverless environment. For two instances (staging and production) plus two redis instances it comes out very cheap (\<20$/months).

- Note: you will need to configure the bucket/storage in which the Resume PDF are saved. We provide a `terraform` option that helps you spin them up in AWS. But you could also opt for LiteCloud FS via Fly.io

2. Docker compose: this is a very simple way to deploy this project though it might be more advanced as it requires knowledge of load balancing, SSH into a VM, etc.
1. DIY: well this is clear and recommended only for those who have a specific strong opinion on how to deploy this app.

For the frontend we recommend to go with Vercel. It's a very simple way to deploy the frontend and it's free for small projects.

## Deploy on Fly.io

## Deploy with Docker Compose on your own VM

## After deployment

### Creating the first superuser

#### Docker Compose

> \[!WARNING\]
> Make sure DB and tables are created before running create_superuser (db should be running and the API should run at least once before)

If you are using docker compose, you should uncomment this part of the docker-compose.yml:

```
  #-------- uncomment to create first superuser --------
  # create_superuser:
  #   build:
  #     context: .
  #     dockerfile: Dockerfile
  #   env_file:
  #     - ./backend/.env
  #   depends_on:
  #     - db
  #   command: python -m backend.scripts.create_first_superuser
  #   volumes:
  #     - ./backend:/code/backend
```

Getting:

```
  #-------- uncomment to create first superuser --------
  create_superuser:
    build:
      context: .
      dockerfile: Dockerfile
    env_file:
      - ./backend/.env
    depends_on:
      - db
    command: python -m backend.scripts.create_first_superuser
    volumes:
      - ./backend:/code/backend
```

While in the base project folder run to start the services:

```sh
docker-compose up -d
```

It will automatically run the create_superuser script as well, but if you want to rerun eventually:

```sh
docker-compose run --rm create_superuser
```

to stop the create_superuser service:

```sh
docker-compose stop create_superuser
```

#### 4.From Scratch

While in the `root` folder, run (after you started the application at least once to create the tables):

```sh
poetry run python -m backend.scripts.create_first_superuser
```

### Creating the first tier

> \[!WARNING\]
> Make sure DB and tables are created before running create_tier (db should be running and the api should run at least once before)

To create the first tier it's similar, you just replace `create_superuser` for `create_tier` service or `create_first_superuser` to `create_first_tier` for scripts. If using `docker compose`, do not forget to uncomment the `create_tier` service in `docker-compose.yml`.

### Database Migrations

If you are using the db in docker, you need to change this in `docker-compose.yml` to run migrations:

```sh
  db:
    image: postgres:13
    env_file:
      - ./backend/.env
    volumes:
      - postgres-data:/var/lib/postgresql/data
    # -------- replace with comment to run migrations with docker --------
    expose:
      - "5432"
    # ports:
    #  - 5432:5432
```

Getting:

```sh
  db:
    ...
    # expose:
    #  - "5432"
    ports:
      - 5432:5432
```

While in the `backend` folder, run Alembic migrations:

```sh
poetry run alembic revision --autogenerate
```

And to apply the migration

```sh
poetry run alembic upgrade head
```

\[!NOTE\]

> If you do not have poetry, you may run it without poetry after running `pip install alembic`

## Running in Production

### Uvicorn Workers with Gunicorn

In production you may want to run using gunicorn to manage uvicorn workers:

```sh
command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

Here it's running with 4 workers, but you should test it depending on how many cores your machine has.

To do this if you are using docker compose, just replace the comment:
This part in `docker-compose.yml`:

```YAML
# docker-compose.yml

# -------- replace with comment to run with gunicorn --------
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

Should be changed to:

```YAML
# docker-compose.yml

# -------- replace with comment to run with uvicorn --------
# command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

And the same in `Dockerfile`:
This part:

```Dockerfile
# Dockerfile

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker". "-b", "0.0.0.0:8000"]
```

Should be changed to:

```Dockerfile
# Dockerfile

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker". "-b", "0.0.0.0:8000"]
```

> \[!CAUTION\]
> Do not forget to set the `ENVIRONMENT` in `.env` to `production` unless you want the API docs to be public.

### Create Application

If you want to stop tables from being created every time you run the api, you should disable this here:

```python
# app/main.py

from .api import router
from .core.config import settings
from .core.setup import create_application

# create_tables_on_start defaults to True
app = create_application(router=router, settings=settings, create_tables_on_start=False)
```

This `create_application` function is defined in `app/core/setup.py`, and it's a flexible way to configure the behavior of your application.

A few examples:

- Deactivate or password protect /docs
- Add client-side cache middleware
- Add Startup and Shutdown event handlers for cache, queue and rate limit

### Running with NGINX

NGINX is a high-performance web server, known for its stability, rich feature set, simple configuration, and low resource consumption. NGINX acts as a reverse proxy, that is, it receives client requests, forwards them to the FastAPI server (running via Uvicorn or Gunicorn), and then passes the responses back to the clients.

To run with NGINX, you start by uncommenting the following part in your `docker-compose.yml`:

```python
# docker-compose.yml

...
# -------- uncomment to run with nginx --------
# nginx:
#   image: nginx:latest
#   ports:
#     - "80:80"
#   volumes:
#     - ./default.conf:/etc/nginx/conf.d/default.conf
#   depends_on:
#     - web
...
```

Which should be changed to:

```YAML
# docker-compose.yml

...
  #-------- uncomment to run with nginx --------
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - web
...
```

Then comment the following part:

```YAML
# docker-compose.yml

services:
  web:
    ...
    # -------- Both of the following should be commented to run with nginx --------
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    # command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

Which becomes:

```YAML
# docker-compose.yml

services:
  web:
    ...
    # -------- Both of the following should be commented to run with nginx --------
    # command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    # command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

Then pick the way you want to run (uvicorn or gunicorn managing uvicorn workers) in `Dockerfile`.
The one you want should be uncommented, comment the other one.

```Dockerfile
# Dockerfile

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker". "-b", "0.0.0.0:8000"]
```

And finally head to `http://localhost/docs`.

#### One Server

If you want to run with one server only, your setup should be ready. Just make sure the only part that is not a comment in `deafult.conf` is:

```conf
# default.conf

# ---------------- Running With One Server ----------------
server {
    listen 80;

    location / {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

So just type on your browser: `http://localhost/docs`.

#### Multiple Servers

NGINX can distribute incoming network traffic across multiple servers, improving the efficiency and capacity utilization of your application.

To run with multiple servers, just comment the `Running With One Server` part in `default.conf` and Uncomment the other one:

```conf
# default.conf

# ---------------- Running With One Server ----------------
...

# ---------------- To Run with Multiple Servers, Uncomment below ----------------
upstream fastapi_app {
    server fastapi1:8000;  # Replace with actual server names or IP addresses
    server fastapi2:8000;
    # Add more servers as needed
}

server {
    listen 80;

    location / {
        proxy_pass http://fastapi_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

And finally, on your browser: `http://localhost/docs`.

> \[!WARNING\]
> Note that we are using `fastapi1:8000` and `fastapi2:8000` as examples, you should replace it with the actual name of your service and the port it's running on.

## Testing

For tests, ensure you have in `.env`:

```
# ------------- test -------------
TEST_NAME="Tester User"
TEST_EMAIL="test@tester.com"
TEST_USERNAME="testeruser"
TEST_PASSWORD="Str1ng$t"
```

While in the tests folder, create your test file with the name "test\_{entity}.py", replacing entity with what you're testing

```sh
touch test_items.py
```

Finally create your tests (you may want to copy the structure in test_user.py)

### Docker Compose

First you need to uncomment the following part in the `docker-compose.yml` file:

```YAML
  #-------- uncomment to run tests --------
  # pytest:
  #   build:
  #     context: .
  #     dockerfile: Dockerfile
  #   env_file:
  #     - ./backend/.env
  #   depends_on:
  #     - db
  #     - create_superuser
  #     - redis
  #   command: python -m pytest ./tests
  #   volumes:
  #     - .:/code
```

You'll get:

```YAML
  #-------- uncomment to run tests --------
  pytest:
    build:
      context: .
      dockerfile: Dockerfile
    env_file:
      - ./backend/.env
    depends_on:
      - db
      - create_superuser
      - redis
    command: python -m pytest ./tests
    volumes:
      - .:/code
```

Start the Docker Compose services:

```sh
docker-compose up -d
```

It will automatically run the tests, but if you want to run again later:

```sh
docker-compose run --rm pytest
```
