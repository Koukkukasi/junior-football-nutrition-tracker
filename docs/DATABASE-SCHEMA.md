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

### users
Primary table for all system users (players and coaches).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 10 AND age <= 25),
    position VARCHAR(20) NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    role VARCHAR(10) DEFAULT 'player' CHECK (role IN ('player', 'coach', 'admin')),
    
    -- Authentication (handled by Clerk, stored for reference)
    clerk_user_id VARCHAR(50) UNIQUE,
    
    -- Profile information
    height_cm INTEGER CHECK (height_cm > 0),
    weight_kg DECIMAL(4,1) CHECK (weight_kg > 0),
    
    -- Privacy and consent (GDPR compliance)
    data_consent_given BOOLEAN DEFAULT false,
    data_consent_date TIMESTAMP,
    marketing_consent BOOLEAN DEFAULT false,
    parent_email VARCHAR(255), -- Required for users under 13
    
    -- Activity tracking
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete for GDPR compliance
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_last_active ON users(last_active_at);
```

**Business Rules**:
- Email must be unique across the system
- Age restricted to 10-25 (junior athletes and young adults)
- Users under 13 require parent email for GDPR compliance
- Soft delete maintains data integrity while respecting "right to be forgotten"

### teams
Team organization and management.

```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_code VARCHAR(10)
