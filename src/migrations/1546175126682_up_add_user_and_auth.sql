CREATE TYPE AuthServiceID AS ENUM ('vk', 'timepad', 'meetup', 'yandex');
CREATE DOMAIN UUID AS CHAR(32);

CREATE TABLE "auth" (
    "id"         UUID PRIMARY KEY,
    "created"    TIMESTAMPTZ DEFAULT NOW(),
    "service_id" AuthServiceID NOT NULL,
    "profile_id" VARCHAR(80) NOT NULL,
    "name"       VARCHAR(256) NOT NULL,
    "photo_url"  VARCHAR(256),
    CONSTRAINT "auth_unique_profile" UNIQUE("service_id", "profile_id")
);

CREATE TABLE "user"
(
    "id"              UUID PRIMARY KEY,
    "created"         TIMESTAMPTZ DEFAULT NOW(),
    "primary_auth_id" UUID NOT NULL,
    CONSTRAINT "user_primary_auth_id_key" FOREIGN KEY (primary_auth_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE "auth_ref" (
    "user_id" UUID NOT NULL,
    "auth_id" UUID NOT NULL,
    CONSTRAINT "unique_auth_ref" UNIQUE("user_id", "auth_id")
);

CREATE INDEX "auth_ref_user_id_idx" ON "auth_ref"("user_id");
CREATE INDEX "auth_ref_auth_id_idx" ON "auth_ref"("auth_id");
