"use client";

import React, { useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { EMAIL_TEMPLATES, type EmailTemplate } from '@/lib/email-templates';
import { Eye, Mail, Pencil, Plus, Search, X, Zap } from 'lucide-react';

function slugifyTemplateId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `custom-${Date.now()}`;
}

export default function EmailMessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [templatesList, setTemplatesList] = useState<EmailTemplate[]>(EMAIL_TEMPLATES);
  const [viewing, setViewing] = useState<EmailTemplate | null>(null);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);

  const templates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return templatesList;
    return templatesList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.trigger.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q)
    );
  }, [searchTerm, templatesList]);

  const handleSaveEdit = (updated: EmailTemplate) => {
    setTemplatesList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditing(null);
  };

  const handleCreate = (draft: {
    name: string;
    subject: string;
    trigger: string;
    previewBody: string;
    fromDefault: string;
  }) => {
    let id = slugifyTemplateId(draft.name);
    const existingIds = new Set(templatesList.map((t) => t.id));
    if (existingIds.has(id)) {
      id = `${id}-${Date.now()}`;
    }

    const created: EmailTemplate = {
      id,
      name: draft.name.trim(),
      subject: draft.subject.trim(),
      trigger: draft.trigger.trim(),
      previewBody: draft.previewBody,
      fromDefault: draft.fromDefault.trim() || 'ACE-SPED <onboarding@resend.dev>',
      source: 'Custom template (admin)',
      variables: Array.from(
        new Set(
          Array.from(draft.previewBody.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)).map(
            (m) => m[1]
          )
        )
      ),
    };

    setTemplatesList((prev) => [...prev, created]);
    setCreating(false);
  };

  return (
    <AdminLayout>
      <div className="min-w-0 max-w-full space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Manage Email Messages
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automated Resend message templates ({templatesList.length} total)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Create new message
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 min-w-0 max-w-full overflow-hidden">
          <div className="h-[70vh] max-w-full overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Template
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Trigger
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-sm text-gray-500 dark:text-gray-400"
                    >
                      No templates match your search.
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr
                      key={template.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4 align-top max-w-[220px]">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                          <Zap className="h-3 w-3" />
                          Auto-send
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top max-w-[260px]">
                        <p
                          className="text-sm text-gray-800 dark:text-gray-200 truncate"
                          title={template.subject}
                        >
                          {template.subject}
                        </p>
                      </td>
                      <td className="py-3 px-4 align-top max-w-[320px]">
                        <p
                          className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                          title={template.trigger}
                        >
                          {template.trigger}
                        </p>
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewing(template)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View template"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(template)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Edit template"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewing ? (
        <EmailTemplateViewModal template={viewing} onClose={() => setViewing(null)} />
      ) : null}

      {editing ? (
        <EmailTemplateEditModal
          template={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      ) : null}

      {creating ? (
        <EmailTemplateCreateModal
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
        />
      ) : null}
    </AdminLayout>
  );
}

function EmailTemplateViewModal({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Mail className="h-5 w-5 text-green-600 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {template.name}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                <Zap className="h-3 w-3" />
                Auto-send
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {template.subject}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 bg-gray-50 dark:bg-gray-950">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Trigger</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">{template.trigger}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Default From
              </p>
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                {template.fromDefault}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Overridden by <code className="font-mono">EMAIL_FROM</code> when set.
              </p>
            </div>
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Source</p>
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                {template.source}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Variables</p>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((variable) => (
                <span
                  key={variable}
                  className="rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-300"
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Message preview
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white">
              <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-5 py-4 text-white">
                <p className="text-[11px] uppercase tracking-wider text-green-100 mb-1">
                  ACE-SPED Email
                </p>
                <p className="font-semibold text-sm sm:text-base leading-snug">
                  {template.subject}
                </p>
              </div>
              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className="text-[13px] sm:text-sm leading-relaxed text-gray-800 whitespace-pre-wrap font-sans">
                  {template.previewBody}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500">
                Sent via Resend · From {template.fromDefault}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailTemplateEditModal({
  template,
  onClose,
  onSave,
}: {
  template: EmailTemplate;
  onClose: () => void;
  onSave: (updated: EmailTemplate) => void;
}) {
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [trigger, setTrigger] = useState(template.trigger);
  const [previewBody, setPreviewBody] = useState(template.previewBody);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...template,
      name: name.trim() || template.name,
      subject: subject.trim() || template.subject,
      trigger: trigger.trim() || template.trigger,
      previewBody,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Edit Email Template
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {template.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-950 flex-1">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Template name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Trigger description
              </label>
              <textarea
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Message body
              </label>
              <textarea
                value={previewBody}
                onChange={(e) => setPreviewBody(e.target.value)}
                rows={14}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Use placeholders like <code className="font-mono">{'{{firstname}}'}</code>. Changes update
                this admin catalog view; live Resend sends still use the server email helpers until
                wired to these templates.
              </p>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmailTemplateCreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (draft: {
    name: string;
    subject: string;
    trigger: string;
    previewBody: string;
    fromDefault: string;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [trigger, setTrigger] = useState('');
  const [fromDefault, setFromDefault] = useState(
    'ACE-SPED Admissions <onboarding@resend.dev>'
  );
  const [previewBody, setPreviewBody] = useState(
    'Dear {{firstname}},\n\n\n\nBest regards,\nACE-SPED Admissions Office'
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !previewBody.trim()) {
      setError('Name, subject, and message body are required.');
      return;
    }
    onCreate({
      name: name.trim(),
      subject: subject.trim(),
      trigger: trigger.trim() || 'Custom message template',
      previewBody,
      fromDefault: fromDefault.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Create New Message
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add a new email message template to the catalog
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-950 flex-1">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Template name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Interview Reminder"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                From (default)
              </label>
              <input
                type="text"
                value={fromDefault}
                onChange={(e) => setFromDefault(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Trigger description
              </label>
              <textarea
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                rows={2}
                placeholder="When should this message be sent?"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Message body
              </label>
              <textarea
                value={previewBody}
                onChange={(e) => setPreviewBody(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Use placeholders like <code className="font-mono">{'{{firstname}}'}</code>. Variables
                are detected automatically from the body.
              </p>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Create message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
