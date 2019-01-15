CREATE TYPE EventServiceID AS ENUM ('vk', 'timepad', 'meetup');

CREATE TABLE "event" (
    "id"          UUID PRIMARY KEY,
    "created"     TIMESTAMPTZ DEFAULT NOW(),
    "service_id"  EventServiceID NOT NULL,
    "event_id"    VARCHAR(80) NOT NULL,
    "title"       VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "start_date"  TIMESTAMPTZ DEFAULT NOW(),
    "address"     VARCHAR(255) NOT NULL,
    CONSTRAINT "unique_event" UNIQUE("service_id", "auth_id")
);

CREATE TABLE "attendee_ref" (
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    CONSTRAINT "unique_attendee_ref" UNIQUE("user_id", "event_id")
)

CREATE INDEX "attendee_ref_user_id_idx" ON "attendee_ref"("user_id");
CREATE INDEX "attendee_ref_event_id_idx" ON "attendee_ref"("event_id");
