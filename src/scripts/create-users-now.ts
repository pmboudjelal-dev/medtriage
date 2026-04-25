// src/scripts/create-users-now.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xqzprojxyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxenByb2p4eXoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzIwMDAwMDAwLCJleHAiOjIwMzU1NjQwMDB9.aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD'
)

async function go() {
  const users = [
    { email: 'doctor@medtriage.dev', pass: 'Doctor123!', name: 'Dr. Sarah Chen', role: 'doctor' },
    { email: 'nurse@medtriage.dev',  pass: 'Nurse123!',  name: 'Nurse James Okafor', role: 'nurse' }
  ]

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.pass,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role }
    })
    if (error) {
      console.log(`→ ${u.email} → ${error.message.includes('already') ? 'موجود بالفعل' : 'فشل'} `)
    } else {
      console.log(`تم إنشاء: ${data.user.email}`)
    }
  }
  console.log('تم يا بطل!')
}

go()