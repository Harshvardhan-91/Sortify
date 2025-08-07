import { db } from '../index'

async function main() {
  console.log('Seeding database...')

  // Create a sample user
  const user = await db.user.create({
    data: {
      email: 'admin@sortify.com',
      name: 'Admin User',
    },
  })

  // Create a sample folder
  const folder = await db.folder.create({
    data: {
      name: 'Documents',
      description: 'Important documents',
      color: '#3B82F6',
      ownerId: user.id,
    },
  })

  console.log('Seeding completed!')
  console.log({ user, folder })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
