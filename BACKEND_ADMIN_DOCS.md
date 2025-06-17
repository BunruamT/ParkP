# ParkPass Backend Administration Documentation

## Overview
This document provides comprehensive administration guidelines for managing the ParkPass backend system using Supabase as the primary database and backend service.

## Table of Contents
1. [Database Administration](#database-administration)
2. [User Management](#user-management)
3. [Monitoring & Analytics](#monitoring--analytics)
4. [Security Management](#security-management)
5. [Backup & Recovery](#backup--recovery)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)
8. [API Management](#api-management)

## Database Administration

### 1.1 Supabase Dashboard Access
- **URL**: `https://app.supabase.com/project/[your-project-id]`
- **Access**: Project owner and invited team members
- **Sections**: Database, Authentication, Storage, Edge Functions, API

### 1.2 Database Schema Management

#### Core Tables Overview
```sql
-- Primary tables and their relationships
users (id) -> vehicles (user_id)
users (id) -> parking_spots (owner_id)
users (id) -> bookings (user_id)
users (id) -> reviews (user_id)
users (id) -> notifications (user_id)

parking_spots (id) -> bookings (spot_id)
parking_spots (id) -> reviews (spot_id)
parking_spots (id) -> parking_spot_images (spot_id)
parking_spots (id) -> availability_blocks (spot_id)

bookings (id) -> payments (booking_id)
bookings (id) -> booking_extensions (booking_id)
```

#### Schema Modifications
```sql
-- Adding new columns (example)
ALTER TABLE users ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adding indexes for performance
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Adding constraints
ALTER TABLE vehicles ADD CONSTRAINT unique_license_per_user 
UNIQUE (user_id, license_plate);
```

### 1.3 Data Maintenance

#### Regular Cleanup Tasks
```sql
-- Clean up expired email verification tokens
UPDATE users 
SET email_verification_token = NULL, 
    email_verification_expires = NULL 
WHERE email_verification_expires < NOW();

-- Archive old notifications (older than 30 days)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days' 
AND is_read = true;

-- Clean up expired sessions
DELETE FROM sessions 
WHERE expires_at < NOW();

-- Archive completed bookings older than 1 year
UPDATE bookings 
SET status = 'archived' 
WHERE status = 'completed' 
AND created_at < NOW() - INTERVAL '1 year';
```

#### Data Integrity Checks
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM vehicles v 
LEFT JOIN users u ON v.user_id = u.id 
WHERE u.id IS NULL;

SELECT COUNT(*) FROM bookings b 
LEFT JOIN parking_spots ps ON b.spot_id = ps.id 
WHERE ps.id IS NULL;

-- Check for inconsistent availability
SELECT ps.id, ps.name, ps.total_slots, ps.available_slots,
       COUNT(b.id) as active_bookings
FROM parking_spots ps
LEFT JOIN bookings b ON ps.id = b.spot_id 
    AND b.status IN ('active', 'pending')
GROUP BY ps.id, ps.name, ps.total_slots, ps.available_slots
HAVING ps.available_slots + COUNT(b.id) != ps.total_slots;
```

## User Management

### 2.1 User Administration

#### User Status Management
```sql
-- Deactivate user account
UPDATE users 
SET is_active = false, 
    updated_at = CURRENT_TIMESTAMP 
WHERE email = 'user@example.com';

-- Reactivate user account
UPDATE users 
SET is_active = true, 
    updated_at = CURRENT_TIMESTAMP 
WHERE email = 'user@example.com';

-- Force email verification
UPDATE users 
SET email_verified = true 
WHERE email = 'user@example.com';
```

#### User Analytics
```sql
-- User registration trends
SELECT DATE_TRUNC('day', created_at) as date,
       user_type,
       COUNT(*) as registrations
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), user_type
ORDER BY date DESC;

-- Active users (logged in within last 30 days)
SELECT COUNT(*) as active_users,
       user_type
FROM users 
WHERE last_login >= NOW() - INTERVAL '30 days'
GROUP BY user_type;

-- User engagement metrics
SELECT u.user_type,
       COUNT(DISTINCT u.id) as total_users,
       COUNT(DISTINCT b.user_id) as users_with_bookings,
       ROUND(COUNT(DISTINCT b.user_id)::numeric / COUNT(DISTINCT u.id) * 100, 2) as engagement_rate
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
GROUP BY u.user_type;
```

### 2.2 Role-Based Access Control

#### Admin User Creation
```sql
-- Create admin user (manual process)
INSERT INTO users (
    email, password_hash, name, user_type, 
    email_verified, is_active
) VALUES (
    'admin@parkpass.com', 
    '$2b$10$...', -- Use proper bcrypt hash
    'System Administrator', 
    'admin',
    true, 
    true
);
```

#### Permission Management
```sql
-- Grant special permissions (implement as needed)
CREATE TABLE user_permissions (
    user_id UUID REFERENCES users(id),
    permission VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, permission)
);

-- Common permissions
INSERT INTO user_permissions (user_id, permission) VALUES
('admin-user-id', 'manage_users'),
('admin-user-id', 'view_analytics'),
('admin-user-id', 'manage_spots'),
('admin-user-id', 'handle_disputes');
```

## Monitoring & Analytics

### 3.1 System Health Monitoring

#### Database Performance Metrics
```sql
-- Table sizes and row counts
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
       pg_stat_get_tuples_returned(c.oid) as rows_read,
       pg_stat_get_tuples_fetched(c.oid) as rows_fetched
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries monitoring
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
WHERE mean_time > 1000 -- queries taking more than 1 second
ORDER BY mean_time DESC
LIMIT 10;

-- Connection statistics
SELECT state, COUNT(*) 
FROM pg_stat_activity 
GROUP BY state;
```

#### Application Metrics
```sql
-- Booking statistics
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    status,
    COUNT(*) as booking_count
FROM bookings 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), status
ORDER BY hour DESC;

-- Revenue analytics
SELECT 
    DATE_TRUNC('day', created_at) as date,
    SUM(total_cost) as daily_revenue,
    COUNT(*) as booking_count,
    AVG(total_cost) as avg_booking_value
FROM bookings 
WHERE status IN ('completed', 'active')
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Popular parking spots
SELECT ps.name, ps.address,
       COUNT(b.id) as total_bookings,
       SUM(b.total_cost) as total_revenue,
       AVG(r.rating) as avg_rating
FROM parking_spots ps
LEFT JOIN bookings b ON ps.id = b.spot_id
LEFT JOIN reviews r ON ps.id = r.spot_id
WHERE ps.is_active = true
GROUP BY ps.id, ps.name, ps.address
ORDER BY total_bookings DESC
LIMIT 10;
```

### 3.2 Real-time Monitoring Setup

#### Supabase Real-time Configuration
```sql
-- Enable real-time for monitoring tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE parking_spots;

-- Create monitoring views
CREATE VIEW active_bookings_summary AS
SELECT 
    COUNT(*) as total_active,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active
FROM bookings 
WHERE status IN ('pending', 'active');
```

#### Alert Configuration
```sql
-- Create alerts table for system notifications
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Function to create alerts
CREATE OR REPLACE FUNCTION create_system_alert(
    p_alert_type VARCHAR(50),
    p_severity TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO system_alerts (alert_type, severity, message, metadata)
    VALUES (p_alert_type, p_severity::alert_severity, p_message, p_metadata)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;
```

## Security Management

### 4.1 Access Control

#### Row Level Security (RLS) Policies
```sql
-- Review and update RLS policies regularly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Audit RLS policy effectiveness
SELECT 
    schemaname, 
    tablename,
    COUNT(*) as policy_count,
    BOOL_AND(enable_row_security) as rls_enabled
FROM information_schema.tables t
LEFT JOIN pg_policies p ON t.table_name = p.tablename
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
GROUP BY schemaname, tablename, enable_row_security;
```

#### API Key Management
```sql
-- Monitor API key usage (implement logging)
CREATE TABLE api_key_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id VARCHAR(100),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    ip_address INET,
    user_agent TEXT,
    response_status INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting monitoring
SELECT 
    ip_address,
    COUNT(*) as request_count,
    MAX(created_at) as last_request
FROM api_key_usage 
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 100 -- Potential abuse
ORDER BY request_count DESC;
```

### 4.2 Data Privacy & GDPR Compliance

#### Data Anonymization
```sql
-- Anonymize user data for GDPR compliance
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Anonymize personal information
    UPDATE users 
    SET 
        email = 'deleted_' || user_uuid || '@example.com',
        name = 'Deleted User',
        phone = NULL,
        profile_image_url = NULL
    WHERE id = user_uuid;
    
    -- Anonymize reviews
    UPDATE reviews 
    SET user_name = 'Anonymous User'
    WHERE user_id = user_uuid;
    
    -- Keep booking data for business records but anonymize
    -- (Consider your legal requirements)
END;
$$ LANGUAGE plpgsql;
```

#### Data Export for GDPR Requests
```sql
-- Function to export all user data
CREATE OR REPLACE FUNCTION export_user_data(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    user_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user', (SELECT row_to_json(u) FROM users u WHERE id = user_uuid),
        'vehicles', (SELECT array_agg(row_to_json(v)) FROM vehicles v WHERE user_id = user_uuid),
        'bookings', (SELECT array_agg(row_to_json(b)) FROM bookings b WHERE user_id = user_uuid),
        'reviews', (SELECT array_agg(row_to_json(r)) FROM reviews r WHERE user_id = user_uuid),
        'notifications', (SELECT array_agg(row_to_json(n)) FROM notifications n WHERE user_id = user_uuid)
    ) INTO user_data;
    
    RETURN user_data;
END;
$$ LANGUAGE plpgsql;
```

## Backup & Recovery

### 5.1 Automated Backups

#### Supabase Backup Configuration
```bash
# Enable automated backups in Supabase dashboard
# Settings > Database > Backups

# Manual backup using pg_dump
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" \
  --clean --if-exists --create --verbose \
  --file="backup_$(date +%Y%m%d_%H%M%S).sql"
```

#### Point-in-Time Recovery
```sql
-- Create restore points for critical operations
SELECT pg_create_restore_point('before_major_update');

-- Monitor WAL files and backup status
SELECT 
    pg_current_wal_lsn() as current_wal,
    pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') / 1024 / 1024 as wal_mb;
```

### 5.2 Disaster Recovery Plan

#### Recovery Procedures
1. **Database Corruption**:
   - Restore from latest automated backup
   - Apply WAL files for point-in-time recovery
   - Verify data integrity

2. **Data Loss**:
   - Identify scope of data loss
   - Restore from backup to staging environment
   - Extract and merge lost data
   - Validate before applying to production

3. **Security Breach**:
   - Immediately revoke all API keys
   - Reset all user passwords
   - Audit access logs
   - Restore from clean backup if necessary

## Performance Optimization

### 6.1 Query Optimization

#### Index Management
```sql
-- Identify missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
    AND n_distinct > 100
    AND correlation < 0.1;

-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0; -- Unused indexes

-- Create performance-critical indexes
CREATE INDEX CONCURRENTLY idx_bookings_user_status 
ON bookings(user_id, status) 
WHERE status IN ('active', 'pending');

CREATE INDEX CONCURRENTLY idx_notifications_user_unread 
ON notifications(user_id, created_at) 
WHERE is_read = false;
```

#### Query Performance Analysis
```sql
-- Analyze slow queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT ps.*, COUNT(b.id) as booking_count
FROM parking_spots ps
LEFT JOIN bookings b ON ps.id = b.spot_id 
    AND b.created_at >= NOW() - INTERVAL '30 days'
WHERE ps.is_active = true
GROUP BY ps.id
ORDER BY booking_count DESC;

-- Update table statistics
ANALYZE users;
ANALYZE parking_spots;
ANALYZE bookings;
```

### 6.2 Connection Pool Management

#### Supabase Connection Settings
```javascript
// Optimal connection pool configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

## Troubleshooting

### 7.1 Common Issues

#### Database Connection Issues
```sql
-- Check active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Kill problematic connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
    AND query_start < NOW() - INTERVAL '5 minutes';
```

#### Performance Issues
```sql
-- Identify table bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_live_tuples(c.oid) as live_tuples,
    pg_stat_get_dead_tuples(c.oid) as dead_tuples
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE schemaname = 'public'
    AND pg_stat_get_dead_tuples(c.oid) > 1000
ORDER BY pg_stat_get_dead_tuples(c.oid) DESC;

-- Manual vacuum for heavily updated tables
VACUUM ANALYZE bookings;
VACUUM ANALYZE notifications;
```

### 7.2 Error Monitoring

#### Application Error Tracking
```sql
-- Create error log table
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100),
    error_message TEXT,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id),
    request_path VARCHAR(255),
    request_method VARCHAR(10),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitor error patterns
SELECT 
    error_type,
    COUNT(*) as error_count,
    MAX(created_at) as last_occurrence
FROM error_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY error_count DESC;
```

## API Management

### 8.1 API Monitoring

#### Rate Limiting Configuration
```javascript
// Express rate limiting setup
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: message });
  }
});

// Different limits for different endpoints
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5, 'Too many auth attempts'));
app.use('/api/bookings', createRateLimit(60 * 1000, 30, 'Too many booking requests'));
app.use('/api', createRateLimit(15 * 60 * 1000, 100, 'Too many requests'));
```

#### API Analytics
```sql
-- Track API usage patterns
CREATE TABLE api_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    response_time INTEGER, -- milliseconds
    status_code INTEGER,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyze API performance
SELECT 
    endpoint,
    method,
    COUNT(*) as request_count,
    AVG(response_time) as avg_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time
FROM api_analytics 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY endpoint, method
ORDER BY request_count DESC;
```

### 8.2 API Documentation Maintenance

#### Endpoint Documentation
```yaml
# OpenAPI specification example
openapi: 3.0.0
info:
  title: ParkPass API
  version: 1.0.0
  description: Parking spot booking and management API

paths:
  /api/spots:
    get:
      summary: Search parking spots
      parameters:
        - name: query
          in: query
          schema:
            type: string
        - name: lat
          in: query
          schema:
            type: number
        - name: lng
          in: query
          schema:
            type: number
      responses:
        200:
          description: List of parking spots
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ParkingSpot'
```

This documentation provides a comprehensive guide for backend administration of the ParkPass system. Regular review and updates of these procedures will ensure optimal system performance and security.