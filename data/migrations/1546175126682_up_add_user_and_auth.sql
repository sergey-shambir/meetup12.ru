CREATE TYPE AuthServiceID AS ENUM ('vk', 'timepad', 'yandex');
CREATE DOMAIN UUID AS CHAR(32);

CREATE TABLE "auth" (
    id         UUID PRIMARY KEY,
    created    TIMESTAMPTZ DEFAULT NOW(),
    service_id AuthServiceID NOT NULL,
    profile_id VARCHAR(80) NOT NULL,
    name       VARCHAR(256) NOT NULL,
    url        VARCHAR(256) NOT NULL,
    photo_url  VARCHAR(256),
    CONSTRAINT unique_profile UNIQUE(service_id, profile_id)
);

CREATE TABLE "user"
(
    id              UUID PRIMARY KEY,
    created         TIMESTAMPTZ DEFAULT NOW(),
    vk_auth_id      UUID NOT NULL,
    timepad_auth_id UUID NOT NULL,
    yandex_auth_id  UUID NOT NULL,
    CONSTRAINT user_vk_auth_id_key FOREIGN KEY (vk_auth_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_timepad_auth_id_key FOREIGN KEY (timepad_auth_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_yandex_auth_id_key FOREIGN KEY (yandex_auth_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE
);
