CREATE TYPE AuthServiceID AS ENUM ('vk', 'timepad', 'meetup', 'yandex');

CREATE TABLE "user"
(
    "id"              UUID PRIMARY KEY,
    "name"            VARCHAR(256) NOT NULL,
    "photo_url"       VARCHAR(256),
    "created"         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "auth" (
    "id"         UUID PRIMARY KEY,
    "user_id"    UUID NOT NULL,
    "created"    TIMESTAMPTZ DEFAULT NOW(),
    "service_id" AuthServiceID NOT NULL,
    "profile_id" VARCHAR(80) NOT NULL,
    "name"       VARCHAR(256) NOT NULL,
    "photo_url"  VARCHAR(256),
    CONSTRAINT "auth_unique_profile"
        UNIQUE("service_id", "profile_id"),
    CONSTRAINT "auth_user_id_key"
        FOREIGN KEY ("user_id")
        REFERENCES "user"("id")
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX "auth_user_id_idx" ON "auth"("user_id");
