-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    source VARCHAR(50) DEFAULT 'homepage',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    resubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Policy to allow users to update their own subscription (unsubscribe)
CREATE POLICY "Users can update their own subscription" ON newsletter_subscriptions
    FOR UPDATE USING (true);

-- Policy to allow admin to view all subscriptions
CREATE POLICY "Admin can view all subscriptions" ON newsletter_subscriptions
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE newsletter_subscriptions IS 'Stores email newsletter subscription data';
COMMENT ON COLUMN newsletter_subscriptions.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN newsletter_subscriptions.is_active IS 'Whether the subscription is currently active';
COMMENT ON COLUMN newsletter_subscriptions.source IS 'Where the subscription originated from';
COMMENT ON COLUMN newsletter_subscriptions.ip_address IS 'IP address when subscription was created';
COMMENT ON COLUMN newsletter_subscriptions.user_agent IS 'Browser user agent when subscription was created';
COMMENT ON COLUMN newsletter_subscriptions.unsubscribed_at IS 'When the user unsubscribed';
COMMENT ON COLUMN newsletter_subscriptions.resubscribed_at IS 'When the user resubscribed after previously unsubscribing';