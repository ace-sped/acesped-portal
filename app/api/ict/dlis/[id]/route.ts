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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dli = await prisma.dli.findUnique({
      where: { id },
      include: { files: true },
    });
    if (!dli) {
      return NextResponse.json({ error: 'DLI not found' }, { status: 404 });
    }
    return NextResponse.json(toMilestoneShape(dli));
  } catch (error) {
    console.error('Error fetching DLI:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DLI' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, type, files: filesPayload } = body;

    const validTypes = ['report', 'assessment', 'policy', 'framework', 'guideline', 'milestone'];
    const typeStr = type != null ? String(type).toLowerCase() : undefined;
    const dliType = typeStr && validTypes.includes(typeStr) ? typeStr : undefined;

    const updateData: { title?: string; type?: string } = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (dliType !== undefined) updateData.type = dliType;

    if (filesPayload !== undefined && Array.isArray(filesPayload)) {
      await prisma.dliFile.deleteMany({ where: { dliId: id } });
      const filesToCreate = filesPayload
        .filter((f: unknown) => f && typeof f === 'object' && 'url' in f && typeof (f as { url: unknown }).url === 'string')
        .map((f: { url: string; fileLabel?: string }) => ({
          dliId: id,
          url: (f as { url: string }).url,
          fileLabel: (f as { fileLabel?: string }).fileLabel ?? null,
        }));
      if (filesToCreate.length > 0) {
        await prisma.dliFile.createMany({ data: filesToCreate });
      }
    }

    const dli = await prisma.dli.update({
      where: { id },
      data: updateData,
      include: { files: true },
    });

    return NextResponse.json(toMilestoneShape(dli));
  } catch (error: unknown) {
    console.error('Error updating DLI:', error);
    const isNotFound =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025';
    if (isNotFound) {
      return NextResponse.json({ error: 'DLI not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update DLI' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dli.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting DLI:', error);
    const isNotFound =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025';
    if (isNotFound) {
      return NextResponse.json({ error: 'DLI not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete DLI' },
      { status: 500 }
    );
  }
}
