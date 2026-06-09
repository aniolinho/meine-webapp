import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { logger } from '@/lib/logger'

export async function GET() {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/posts')

  logger.info({ route: '/api/posts', method: 'GET' }, 'Fetching all posts')

  try {
    const posts = await prisma.post.findMany({
      include: { user: true }
    })

    span?.setAttribute('posts.count', posts.length)
    logger.info({ route: '/api/posts', postCount: posts.length }, 'Successfully fetched posts')
    return NextResponse.json(posts)
  } catch (error) {
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/posts',
      method: 'GET',
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Failed to fetch posts')
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/posts')

  logger.info({ route: '/api/posts', method: 'POST' }, 'Creating new post')

  try {
    const body = await request.json()
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        userId: body.userId
      }
    })

    span?.setAttribute('post.id', post.id)
    span?.setAttribute('user.id', post.userId)
    logger.info({ route: '/api/posts', postId: post.id, userId: post.userId }, 'Post created successfully')
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/posts',
      method: 'POST',
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Failed to create post')
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/posts')

  logger.info({ route: '/api/posts', method: 'DELETE' }, 'Deleting post')

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const postId = parseInt(id)
    span?.setAttribute('post.id', postId)

    await prisma.post.delete({
      where: { id: postId }
    })

    logger.info({ route: '/api/posts', postId }, 'Post deleted successfully')
    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 })
  } catch (error) {
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/posts',
      method: 'DELETE',
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Failed to delete post')
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
