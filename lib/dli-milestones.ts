import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Target,
  CheckCircle2,
  BookOpen,
  ClipboardList,
} from 'lucide-react';

export type DocType = 'report' | 'assessment' | 'policy' | 'framework' | 'guideline' | 'milestone';

export interface DliFile {
  url: string;
  fileLabel?: string;
}

export interface MilestoneDocument {
  id: string;
  title: string;
  type: DocType;
  /** Primary/first file URL (for backward compatibility; use files[0].url when files exists) */
  documentUrl: string;
  /** Primary/first file label (for backward compatibility; use files[0].fileLabel when files exists) */
  fileLabel?: string;
  /** All uploaded files - matches Add New DLI modal. When present, use this for display. */
  files?: DliFile[];
  /** Optional; not collected by Add New DLI modal */
  description?: string;
  /** Optional; not collected by Add New DLI modal */
  phase?: string;
  /** Optional; not collected by Add New DLI modal */
  date?: string;
}

export const milestoneDocuments: MilestoneDocument[] = [
  {
    id: '1',
    title: 'DLI Inception Report',
    description:
      'Initial assessment and baseline for Digital Learning Initiatives at ACE-SPED, including stakeholder analysis and readiness evaluation.',
    phase: 'Phase 1',
    date: 'Q1 2024',
    type: 'report',
    documentUrl: '#',
    fileLabel: 'DLI-Inception-Report.pdf',
  },
  {
    id: '2',
    title: 'Curriculum Integration Framework',
    description:
      'Framework for integrating digital learning tools and methodologies into existing power and energy programmes.',
    phase: 'Phase 1',
    date: 'Q2 2024',
    type: 'framework',
    documentUrl: '#',
    fileLabel: 'Curriculum-Integration-Framework.pdf',
  },
  {
    id: '3',
    title: 'Digital Learning Needs Assessment',
    description:
      'Comprehensive needs assessment covering infrastructure, faculty capacity, and student access to digital resources.',
    phase: 'Phase 2',
    date: 'Q2 2024',
    type: 'assessment',
    documentUrl: '#',
    fileLabel: 'DLI-Needs-Assessment.pdf',
  },
  {
    id: '4',
    title: 'DLI Implementation Policy',
    description:
      'Institutional policy and guidelines for rollout of digital learning initiatives across the Centre.',
    phase: 'Phase 2',
    date: 'Q3 2024',
    type: 'policy',
    documentUrl: '#',
    fileLabel: 'DLI-Implementation-Policy.pdf',
  },
  {
    id: '5',
    title: 'Mid-Term Progress Report',
    description:
      'Progress report on milestones achieved, challenges, and adjustments for the second phase of DLI.',
    phase: 'Phase 3',
    date: 'Q4 2024',
    type: 'report',
    documentUrl: '#',
    fileLabel: 'DLI-Mid-Term-Report.pdf',
  },
  {
    id: '6',
    title: 'Quality Assurance Guideline',
    description:
      'Guidelines for quality assurance and evaluation of digital learning content and delivery.',
    phase: 'Phase 3',
    date: 'Q1 2025',
    type: 'guideline',
    documentUrl: '#',
    fileLabel: 'DLI-QA-Guideline.pdf',
  },
];

export const dliTypeConfig: Record<
  DocType,
  { label: string; icon: LucideIcon; color: string }
> = {
  report: {
    label: 'Report',
    icon: FileText,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  assessment: {
    label: 'Assessment',
    icon: ClipboardList,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  policy: {
    label: 'Policy',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  framework: {
    label: 'Framework',
    icon: Target,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  guideline: {
    label: 'Guideline',
    icon: CheckCircle2,
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  },
  milestone: {
    label: 'Milestone',
    icon: FileText,
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  },
};
