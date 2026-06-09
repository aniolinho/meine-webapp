import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { logger } from '@/lib/logger'

export async function GET() {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/users')

  logger.info({ route: '/api/users', method: 'GET' }, 'Fetching all users')

  try {
    const users = await prisma.user.findMany({
      include: { posts: true }
    })

    span?.setAttribute('users.count', users.length)
    logger.info({ route: '/api/users', userCount: users.length }, 'Successfully fetched users')
    return NextResponse.json(users)
  } catch (error) {
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/users',
      method: 'GET',
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Failed to fetch users')
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/users')

  logger.info({ route: '/api/users', method: 'POST' }, 'Creating new user')

  try {
    const body = await request.json()

    logger.debug({ route: '/api/users', data: body }, 'User creation data received')

    const user = await prisma.user.create({
      data: { name: body.name, email: body.email }
    })

    span?.setAttribute('user.id', user.id)
    logger.info({ route: '/api/users', userId: user.id, email: user.email }, 'User created successfully')
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/users',
      method: 'POST',
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Failed to create user')
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/users')

  logger.info({ route: '/api/users', method: 'DELETE' }, 'Deleting user')

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const userId = parseInt(id)

    span?.setAttribute('user.id', userId)

    // Delete all posts of the user first (cascade delete)
    await prisma.post.deleteMany({
      where: { userId }
    })

    // Then delete the user
    await prisma.user.delete({
      where: { id: userId }
    })

    logger.info({ route: '/api/users', userId }, 'User and associated posts deleted successfully')
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/users',
      method: 'DELETE',
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Failed to delete user')
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}