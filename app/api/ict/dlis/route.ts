import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function toMilestoneShape(dli: { id: string; title: string; type: string; files: { url: string; fileLabel: string | null }[] }) {
  const files = dli.files.map((f) => ({ url: f.url, fileLabel: f.fileLabel ?? undefined }));
  const first = files[0];
  return {
    id: dli.id,
    title: dli.title,
    type: dli.type,
    documentUrl: first?.url ?? '#',
    fileLabel: first?.fileLabel,
    files: files.length > 0 ? files : undefined,
  };
}

export async function GET() {
  try {
    const dlis = await prisma.dli.findMany({
      orderBy: { createdAt: 'desc' },
      include: { files: true },
    });
    const data = dlis.map(toMilestoneShape);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching DLIs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DLIs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, files: filesPayload } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const validTypes = ['report', 'assessment', 'policy', 'framework', 'guideline', 'milestone'];
    const typeStr = (type || 'report').toLowerCase();
    const dliType = validTypes.includes(typeStr) ? typeStr : 'report';

    const files = Array.isArray(filesPayload) ? filesPayload : [];
    const filesToCreate = files
      .filter((f: unknown) => f && typeof f === 'object' && 'url' in f && typeof (f as { url: unknown }).url === 'string')
      .map((f: { url: string; fileLabel?: string }) => ({
        url: f.url,
        fileLabel: f.fileLabel ?? null,
      }));

    const dli = await prisma.dli.create({
      data: {
        title: title.trim(),
        type: dliType,
        files:
          filesToCreate.length > 0
            ? { create: filesToCreate }
            : undefined,
      },
      include: { files: true },
    });

    return NextResponse.json(toMilestoneShape(dli), { status: 201 });
  } catch (error) {
    console.error('Error creating DLI:', error);
    return NextResponse.json(
      { error: 'Failed to create DLI' },
      { status: 500 }
    );
  }
}
