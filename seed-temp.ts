// هذا ملف مؤقت لإنشاء المستخدمين بدون الحاجة لـ .env.local
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://abcde12345.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlMTIzNDUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzIwMDAwMDAwLCJleHAiOjIwMzU1NjQwMDB9.xyz1234567890abcdefghijklmnopqrstuvwxyz'
);

async function seed() {
  const users = [
    { email: 'doctor@medtriage.dev', password: 'Doctor123!', name: 'Dr. Sarah Chen', role: 'doctor' },
    { email: 'nurse@medtriage.dev',  password: 'Nurse123!',  name: 'Nurse James Okafor', role: 'nurse' },
  ];

  console.log('Creating test users...\n');

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`Already exists: ${u.email}`);
      } else {
        console.error(`Failed: ${u.email}`, error.message);
      }
    } else {
      console.log(`Created: ${data.user?.email}`);
    }
  }
  console.log('\nDone!');
}

seed();
