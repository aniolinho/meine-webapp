import { NextResponse } from 'next/server'
import { PrismaClient } from '.prisma/client/default'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function GET() {
  const users = await prisma.user.findMany({
    include: { posts: true }
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email }
  })
  return NextResponse.json(user, { status: 201 })
}