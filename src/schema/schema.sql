CREATE TABLE user IF NOT EXISTS (
    id         SERIAL PRIMARY KEY,
    created    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth IF NOT EXISTS (
    id         SERIAL PRIMARY KEY,
    service_id INT 4 NOT NULL,
    profile_id VARCHAR(80) NOT NULL,
    name       VARCHAR(256) NOT NULL,
    url        VARCHAR(256) NOT NULL,
    photo_url  VARCHAR(256),
    created    TIMESTAMPTZ DEFAULT NOW(),
    INDEX ON auth (service_id, profile_id),
    CONSTRAINT auth_service_service_id_fkey FOREIGN KEY (service_id) REFERENCES auth_service(service_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE auth_ref IF NOT EXISTS (
    user_id INT4 NOT NULL,
    auth_id INT4 NOT NULL,
    INDEX ON auth_ref(user_id, auth_id),
    CONSTRAINT auth_ref_user_id_fkey FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT auth_ref_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth(auth_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE auth_service IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    service    VARCHAR(80) PRIMARY KEY
);
