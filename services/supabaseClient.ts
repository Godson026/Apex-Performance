import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://odshroqnlxpfplpvuexf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kc2hyb3FubHhwZnBscHZ1ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDQ5NjQsImV4cCI6MjA2NzkyMDk2NH0.FIyikFXwH7jWkleFYGLrEHs4G8kGB1e5VMtDYp6mgHY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)