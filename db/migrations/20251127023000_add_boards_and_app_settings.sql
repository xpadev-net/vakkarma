--migrate:up
CREATE TABLE boards(
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    board_name TEXT NOT NULL,
    local_rule TEXT NOT NULL,
    nanashi_name TEXT NOT NULL,
    max_content_length INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_boards_is_default ON boards((is_default)) WHERE is_default;

CREATE TABLE app_settings(
    id INT PRIMARY KEY CHECK (id = 1),
    admin_password TEXT NOT NULL,
    default_board_id UUID NOT NULL REFERENCES boards(id)
);

ALTER TABLE threads ADD COLUMN board_id UUID;

DO $$
DECLARE
    v_board_id UUID;
    v_slug TEXT := 'default';
    v_board_name TEXT;
    v_local_rule TEXT;
    v_nanashi_name TEXT;
    v_max_content_length INT;
    v_admin_password TEXT;
BEGIN
    SELECT
        board_name,
        local_rule,
        nanashi_name,
        max_content_length,
        admin_password
    INTO
        v_board_name,
        v_local_rule,
        v_nanashi_name,
        v_max_content_length,
        v_admin_password
    FROM config
    LIMIT 1;

    IF v_board_name IS NULL THEN
        RAISE EXCEPTION 'config table must contain a row to migrate';
    END IF;

    v_board_id := uuid_in(md5(random()::text || clock_timestamp()::text)::cstring);

    INSERT INTO boards(
        id,
        slug,
        board_name,
        local_rule,
        nanashi_name,
        max_content_length,
        is_active,
        is_default,
        order_index
    ) VALUES (
        v_board_id,
        v_slug,
        v_board_name,
        v_local_rule,
        v_nanashi_name,
        v_max_content_length,
        TRUE,
        TRUE,
        0
    );

    UPDATE threads SET board_id = v_board_id;

    INSERT INTO app_settings(id, admin_password, default_board_id)
    VALUES (1, v_admin_password, v_board_id);
END $$;

ALTER TABLE threads
    ALTER COLUMN board_id SET NOT NULL;

ALTER TABLE threads
    ADD CONSTRAINT threads_board_id_fkey
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE RESTRICT;

CREATE INDEX idx_threads_board_updated_at ON threads(board_id, updated_at DESC);

DROP TABLE config;

--migrate:down
CREATE TABLE config(
    board_name TEXT PRIMARY KEY,
    local_rule TEXT NOT NULL,
    nanashi_name TEXT NOT NULL,
    max_content_length INT NOT NULL,
    admin_password TEXT NOT NULL
);

INSERT INTO config(
    board_name,
    local_rule,
    nanashi_name,
    max_content_length,
    admin_password
)
SELECT
    b.board_name,
    b.local_rule,
    b.nanashi_name,
    b.max_content_length,
    s.admin_password
FROM boards b
JOIN app_settings s
    ON s.default_board_id = b.id
WHERE b.is_default
LIMIT 1;

ALTER TABLE threads
    DROP CONSTRAINT IF EXISTS threads_board_id_fkey;

DROP INDEX IF EXISTS idx_threads_board_updated_at;

ALTER TABLE threads
    DROP COLUMN IF EXISTS board_id;

DROP TABLE app_settings;

DROP TABLE boards;

