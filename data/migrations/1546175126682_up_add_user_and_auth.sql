CREATE TYPE ServiceID AS ENUM ('vk', 'timepad', 'yandex');

CREATE TABLE "auth" (
    id         SERIAL PRIMARY KEY,
    service_id ServiceID NOT NULL,
    profile_id VARCHAR(80) NOT NULL,
    name       VARCHAR(256) NOT NULL,
    url        VARCHAR(256) NOT NULL,
    photo_url  VARCHAR(256),
    created    TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_profile_reuse UNIQUE(service_id, profile_id)
);

CREATE TABLE "user"
(
    id         SERIAL PRIMARY KEY,
    created    TIMESTAMPTZ DEFAULT NOW(),
    vk_id      INT4 NOT NULL,
    timepad_id INT4 NOT NULL,
    yandex_id  INT4 NOT NULL,
    CONSTRAINT user_vk_id_key FOREIGN KEY (vk_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_timepad_id_key FOREIGN KEY (timepad_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_yandex_id_key FOREIGN KEY (yandex_id) REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE
);
