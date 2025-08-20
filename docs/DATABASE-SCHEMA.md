# Database Schema - Junior Football Nutrition Tracker

## Overview

This document defines the complete database schema for the Junior Football Nutrition Tracker application. The schema is designed for PostgreSQL with Prisma ORM, prioritizing data integrity, performance, and GDPR compliance.

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Teams    │────▶│    Users    │────▶│ FoodEntries │
│             │     │             │     │             │
│ id          │     │ id          │     │ id          │
│ name        │     │ email       │     │ userId      │
│ teamCode    │     │ name        │     │ mealType    │
│ coachId     │     │ age         │     │ time        │
│             │     │ position    │     │ location    │
└─────────────┘     │ teamId      │     │ foods       │
                    │ role        │     │ date        │
                    └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │Performance  │
                    │ Metrics     │
                    │             │
                    │ id          │
                    │ userId      │
                    │ date        │
                    │ energyLevel │
                    │ sleepHours  │
                    └─────────────┘
```

## Core Tables

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 6 AND age <= 25),
    position VARCHAR(50), -- Football position
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'PLAYER',
    height_cm INTEGER CHECK (height_cm > 0),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0),
    dietary_restrictions TEXT[],
    goals JSONB,
    preferences JSONB,
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    emergency_contact JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Enums
CREATE TYPE user_role AS ENUM ('PLAYER', 'COACH', 'ADMIN');

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

### Teams Table

```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_code VARCHAR(8) UNIQUE NOT NULL,
    coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    league VARCHAR(100),
    age_group VARCHAR(50),
    settings JSONB DEFAULT '{}',
    max_members INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_teams_team_code ON teams(team_code);
CREATE INDEX idx_teams_coach_id ON teams(coach_id);
CREATE INDEX idx_teams_archived_at ON teams(archived_at);

-- Trigger to generate team code
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.team_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_team_code
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION generate_team_code();
```

### Food Entries Table

```sql
CREATE TABLE food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type meal_type_enum NOT NULL,
    date DATE NOT NULL,
    time TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    foods JSONB NOT NULL, -- Array of food items
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    photo_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums
CREATE TYPE meal_type_enum AS ENUM (
    'BREAKFAST',
    'LUNCH', 
    'DINNER',
    'SNACK',
    'PRE_TRAINING',
    'POST_TRAINING'
);

-- Indexes
CREATE INDEX idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX idx_food_entries_date ON food_entries(date);
CREATE INDEX idx_food_entries_user_date ON food_entries(user_id, date);
CREATE INDEX idx_food_entries_meal_type ON food_entries(meal_type);

-- JSON structure for foods field:
-- [
--   {
--     "name": "string",
--     "quantity": number,
--     "unit": "string",
--     "calories": number,
--     "protein": number,
--     "carbs": number,
--     "fat": number,
--     "fiber": number
--   }
-- ]
```

### Performance Metrics Table

```sql
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    hydration_glasses INTEGER CHECK (hydration_glasses >= 0),
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    training_intensity INTEGER CHECK (training_intensity >= 1 AND training_intensity <= 10),
    training_duration INTEGER, -- minutes
    training_type VARCHAR(100),
    injuries TEXT[],
    symptoms TEXT[],
    weight_kg DECIMAL(5,2),
    resting_heart_rate INTEGER,
    notes TEXT,
    weather_conditions VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date);
CREATE INDEX idx_performance_metrics_user_date ON performance_metrics(user_id, date);
```

## Supporting Tables

### Food Database Table

```sql
CREATE TABLE food_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    barcode VARCHAR(50),
    category VARCHAR(100),
    
    -- Nutrition per 100g
    calories DECIMAL(8,2) NOT NULL,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fat DECIMAL(8,2) DEFAULT 0,
    fiber DECIMAL(8,2) DEFAULT 0,
    sugar DECIMAL(8,2) DEFAULT 0,
    sodium DECIMAL(8,2) DEFAULT 0,
    
    -- Additional nutrients (per 100g)
    vitamin_c DECIMAL(8,2),
    vitamin_d DECIMAL(8,2),
    calcium DECIMAL(8,2),
    iron DECIMAL(8,2),
    
    common_servings JSONB, -- [{"name": "1 cup", "grams": 240}]
    allergens TEXT[],
    verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(100), -- API source or manual entry
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_food_database_name ON food_database(name);
CREATE INDEX idx_food_database_brand ON food_database(brand);
CREATE INDEX idx_food_database_barcode ON food_database(barcode);
CREATE INDEX idx_food_database_category ON food_database(category);
CREATE INDEX idx_food_database_verified ON food_database(verified);

-- Full text search
CREATE INDEX idx_food_database_search ON food_database 
USING gin(to_tsvector('english', name || ' ' || COALESCE(brand, '')));
```

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    data JSONB, -- Additional notification data
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums
CREATE TYPE notification_type_enum AS ENUM (
    'MEAL_REMINDER',
    'PERFORMANCE_LOG',
    'TEAM_MESSAGE',
    'GOAL_ACHIEVEMENT',
    'SYSTEM_ALERT',
    'COACH_MESSAGE'
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### Goals Table

```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type goal_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    target_date DATE,
    achieved BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMPTZ,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums
CREATE TYPE goal_type_enum AS ENUM (
    'WEIGHT_LOSS',
    'WEIGHT_GAIN',
    'MUSCLE_GAIN',
    'ENDURANCE',
    'STRENGTH',
    'NUTRITION',
    'HYDRATION',
    'SLEEP',
    'CUSTOM'
);

-- Indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_type ON goals(type);
CREATE INDEX idx_goals_achieved ON goals(achieved);
CREATE INDEX idx_goals_target_date ON goals(target_date);
```

## Audit and Logging Tables

### Audit Log Table

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action_enum NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums
CREATE TYPE audit_action_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Indexes
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

### Sessions Table

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked ON sessions(revoked);
```

## Views and Functions

### User Statistics View

```sql
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.age,
    u.team_id,
    COUNT(DISTINCT fe.id) as total_food_entries,
    COUNT(DISTINCT pm.id) as total_performance_logs,
    AVG(pm.energy_level) as avg_energy_level,
    AVG(pm.sleep_hours) as avg_sleep_hours,
    AVG(fe.total_calories) as avg_daily_calories,
    DATE(MAX(fe.created_at)) as last_food_entry,
    DATE(MAX(pm.created_at)) as last_performance_log,
    u.created_at as joined_at
FROM users u
LEFT JOIN food_entries fe ON u.id = fe.user_id 
    AND fe.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN performance_metrics pm ON u.id = pm.user_id 
    AND pm.created_at > NOW() - INTERVAL '30 days'
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.age, u.team_id, u.created_at;
```

### Daily Nutrition Summary Function

```sql
CREATE OR REPLACE FUNCTION get_daily_nutrition_summary(
    p_user_id UUID,
    p_date DATE
)
RETURNS TABLE (
    date DATE,
    total_calories DECIMAL,
    total_protein DECIMAL,
    total_carbs DECIMAL,
    total_fat DECIMAL,
    meal_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_date,
        SUM(fe.total_calories) as total_calories,
        SUM(fe.total_protein) as total_protein,
        SUM(fe.total_carbs) as total_carbs,
        SUM(fe.total_fat) as total_fat,
        jsonb_object_agg(
            fe.meal_type,
            jsonb_build_object(
                'calories', fe.total_calories,
                'protein', fe.total_protein,
                'carbs', fe.total_carbs,
                'fat', fe.total_fat
            )
        ) as meal_breakdown
    FROM food_entries fe
    WHERE fe.user_id = p_user_id 
    AND fe.date = p_date
    GROUP BY p_date;
END;
$$ LANGUAGE plpgsql;
```

## Triggers and Constraints

### Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_food_entries_updated_at
    BEFORE UPDATE ON food_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_performance_metrics_updated_at
    BEFORE UPDATE ON performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Nutrition Totals Trigger

```sql
CREATE OR REPLACE FUNCTION calculate_nutrition_totals()
RETURNS TRIGGER AS $$
DECLARE
    food_item JSONB;
    total_cal DECIMAL := 0;
    total_prot DECIMAL := 0;
    total_carb DECIMAL := 0;
    total_fat_val DECIMAL := 0;
BEGIN
    -- Calculate totals from foods JSON array
    FOR food_item IN SELECT * FROM jsonb_array_elements(NEW.foods)
    LOOP
        total_cal := total_cal + COALESCE((food_item->>'calories')::DECIMAL, 0);
        total_prot := total_prot + COALESCE((food_item->>'protein')::DECIMAL, 0);
        total_carb := total_carb + COALESCE((food_item->>'carbs')::DECIMAL, 0);
        total_fat_val := total_fat_val + COALESCE((food_item->>'fat')::DECIMAL, 0);
    END LOOP;
    
    NEW.total_calories := total_cal;
    NEW.total_protein := total_prot;
    NEW.total_carbs := total_carb;
    NEW.total_fat := total_fat_val;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_nutrition_totals
    BEFORE INSERT OR UPDATE ON food_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_nutrition_totals();
```

## Security and Permissions

### Row Level Security

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_own_data ON users
    FOR ALL TO authenticated
    USING (id = current_user_id());

-- Users can only access their own food entries
CREATE POLICY user_own_food_entries ON food_entries
    FOR ALL TO authenticated
    USING (user_id = current_user_id());

-- Coaches can see team member data
CREATE POLICY coach_team_access ON food_entries
    FOR SELECT TO authenticated
    USING (
        user_id IN (
            SELECT u.id FROM users u
            JOIN teams t ON u.team_id = t.id
            WHERE t.coach_id = current_user_id()
        )
    );
```

### Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_food_entries_user_date_meal ON food_entries(user_id, date, meal_type);
CREATE INDEX idx_performance_metrics_user_date_energy ON performance_metrics(user_id, date, energy_level);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, created_at);

-- Partial indexes
CREATE INDEX idx_active_users ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_unread_notifications ON notifications(user_id, created_at) WHERE read = false;
CREATE INDEX idx_recent_food_entries ON food_entries(user_id, created_at) 
    WHERE created_at > NOW() - INTERVAL '7 days';
```

## Data Retention and Cleanup

### Cleanup Functions

```sql
-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions 
    WHERE expires_at < NOW() 
    OR (revoked = true AND revoked_at < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Clean up old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

## Performance Considerations

1. **Partitioning**: Consider partitioning `food_entries` and `performance_metrics` by date for large datasets
2. **Archiving**: Implement archiving strategy for old data
3. **Indexing**: Monitor query patterns and add indexes as needed
4. **Connection Pooling**: Use connection pooling in application layer
5. **Read Replicas**: Consider read replicas for analytics queries

## GDPR Compliance

### Data Anonymization

```sql
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Anonymize user data while preserving foreign key relationships
    UPDATE users SET
        email = 'deleted_' || id || '@example.com',
        name = 'Deleted User',
        phone = NULL,
        emergency_contact = NULL,
        preferences = NULL,
        deleted_at = NOW()
    WHERE id = p_user_id;
    
    -- Anonymize related data
    UPDATE food_entries SET
        location = NULL,
        notes = NULL,
        photo_urls = NULL
    WHERE user_id = p_user_id;
    
    UPDATE performance_metrics SET
        notes = NULL
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

This database schema provides a robust foundation for the Junior Football Nutrition Tracker application, with proper normalization, performance optimization, security measures, and GDPR compliance considerations.