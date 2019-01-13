# meetup12.ru

meetup12.ru source code

## Setup dev environment

It's recommended to use Ubuntu or Debian. Do the following:

1) Install Docker
2) Install node 10.x or higher

## How to build and run

```bash
# build docker container
npm run prerelease

# run containers with docker-compose
npm run compose -- up -d

# stop containers
npm run compose -- down
```

## How to debug in VSCode

First run database container:

```bash
npm run compose -- up -d meetup12ru-db
```

Then create Node.js debug configuration like this:

```json
"program": "${workspaceFolder}/src/index.js",
"env": {
    "SITE_CONFIG": "config.json",
    "SITE_DSN": "postgres://meetup12ru:1234@localhost/meetup12ru",
    "SITE_SESSION_SECRET": "amqg7i0Q",
    "SITE_PORT_HTTP": "3000"
}
```

Create "./config.json" file with OAuth2 apps tokens:

```json
{
    "vk_app": {
        "client_id": "<your secret>",
        "client_secret": "<your secret>"
    },
    "yandex_app": {
        "client_id": "<your secret>",
        "client_secret": "<your secret>"
    }
}
```

Use this configuration for debugging.
