import { db } from './connection.ts'
import { users } from './schema.ts'
import { hashPassword } from '../utils/password.ts'

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Clear existing data
    console.log('Clearing existing data...')
    await db.delete(users)

    // Create demo users
    console.log('Creating demo users...')
    const hashedPassword = await hashPassword('demo123')

    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@usermanagement.com',
        username: 'demouser',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
      })
      .returning()

    const [johnDoe] = await db
      .insert(users)
      .values({
        email: 'john@example.com',
        username: 'johndoe',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
      })
      .returning()

    const [janeSmith] = await db
      .insert(users)
      .values({
        email: 'jane@example.com',
        username: 'janesmith',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
      })
      .returning()

    console.log('✅ Database seeded successfully!')
    console.log('\n📊 Seed Summary:')
    console.log('- 3 demo users created')
    console.log('\n🔑 Login Credentials:')
    console.log('Email: demo@usermanagement.com')
    console.log('Password: demo123')
    console.log('\nEmail: john@example.com')
    console.log('Password: demo123')
    console.log('\nEmail: jane@example.com')
    console.log('Password: demo123')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seed