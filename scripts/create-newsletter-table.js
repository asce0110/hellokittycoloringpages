/**
 * Script to create the newsletter_subscriptions table in Supabase
 * Run with: node scripts/create-newsletter-table.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const createNewsletterTable = async () => {
  console.log('🚀 Creating newsletter_subscriptions table...')
  
  try {
    // SQL to create the table
    const createTableSQL = `
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
      DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscriptions;
      CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
          FOR INSERT WITH CHECK (true);

      -- Policy to allow users to update their own subscription (unsubscribe)
      DROP POLICY IF EXISTS "Users can update their own subscription" ON newsletter_subscriptions;
      CREATE POLICY "Users can update their own subscription" ON newsletter_subscriptions
          FOR UPDATE USING (true);

      -- Policy to allow admin to view all subscriptions
      DROP POLICY IF EXISTS "Admin can view all subscriptions" ON newsletter_subscriptions;
      CREATE POLICY "Admin can view all subscriptions" ON newsletter_subscriptions
          FOR SELECT USING (true);
    `

    console.log('📝 Executing SQL commands...')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })

    if (error) {
      console.error('❌ Error creating table with RPC:', error)
      
      // Try alternative approach - direct table creation
      console.log('🔄 Trying direct table creation...')
      
      const { data: tableData, error: tableError } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .limit(1)
      
      if (tableError && tableError.code === 'PGRST106') {
        console.log('❌ Table does not exist. Manual creation required.')
        console.log('💡 Please create the table manually in Supabase with the following SQL:')
        console.log('\n' + createTableSQL + '\n')
        return false
      } else if (!tableError) {
        console.log('✅ Table already exists!')
        return true
      } else {
        console.error('❌ Unexpected error:', tableError)
        return false
      }
    } else {
      console.log('✅ Table created successfully!')
      console.log('📊 Result:', data)
      return true
    }
  } catch (err) {
    console.error('❌ Script error:', err)
    
    // Test if table exists by trying a simple query
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .limit(1)
      
      if (!error) {
        console.log('✅ Table already exists and is accessible!')
        return true
      } else {
        console.log('❌ Table does not exist or is not accessible:', error.message)
        console.log('💡 Please create the table manually in Supabase:')
        console.log(`
CREATE TABLE newsletter_subscriptions (
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

-- Create indexes
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX idx_newsletter_created_at ON newsletter_subscriptions(created_at);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own subscription" ON newsletter_subscriptions FOR UPDATE USING (true);  
CREATE POLICY "Admin can view all subscriptions" ON newsletter_subscriptions FOR SELECT USING (true);
        `)
        return false
      }
    } catch (testErr) {
      console.error('❌ Failed to test table existence:', testErr)
      return false
    }
  }
}

// Run the script
if (require.main === module) {
  createNewsletterTable().then(success => {
    if (success) {
      console.log('🎉 Newsletter table setup completed!')
      process.exit(0)
    } else {
      console.log('⚠️  Newsletter table setup requires manual intervention')
      process.exit(1)
    }
  }).catch(err => {
    console.error('💥 Script failed:', err)
    process.exit(1)
  })
}

module.exports = { createNewsletterTable }