CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(128) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    address VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_profiles_display_name_not_blank
        CHECK (LENGTH(TRIM(display_name)) >= 2)
);

CREATE INDEX IF NOT EXISTS user_profiles_updated_at_idx
    ON user_profiles (updated_at DESC);

