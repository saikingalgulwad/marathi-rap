import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, title, thumbnail } = await req.json()
  const like = await prisma.like.create({ data: { userId: session.user.id, videoId, title, thumbnail } })
  return NextResponse.json(like)
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId } = await req.json()
  await prisma.like.deleteMany({ where: { userId: session.user.id, videoId } })
  return NextResponse.json({ ok: true })
}
