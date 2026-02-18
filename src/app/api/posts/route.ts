import { NextResponse } from 'next/server'
import { PrismaClient } from '.prisma/client/default'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { user: true }
  })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      userId: body.userId
    }
  })
  return NextResponse.json(post, { status: 201 })
}