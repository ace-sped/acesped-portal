'use client';

import React, { useState } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import { Plus, X, Upload, Pencil, Trash2, ExternalLink, Download } from 'lucide-react';
import { dliTypeConfig } from '@/lib/dli-milestones';
import type { DocType, MilestoneDocument } from '@/lib/dli-milestones';

const DOC_TYPES: DocType[] = ['report', 'assessment', 'policy', 'framework', 'guideline'];

interface UploadRow {
  id: string;
  file: File | null;
  fileLabel: string;
}

const createUploadRow = (): UploadRow => ({
  id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  file: null,
  fileLabel: '',
});

export default function ICTDLIsPage() {
  const [documents, setDocuments] = useState<MilestoneDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDlis = async () => {
    try {
      const res = await fetch('/api/ict/dlis');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch DLIs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDlis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [editForm, setEditForm] = useState<{ title: string; type: DocType }>({ title: '', type: 'report' });
  const [editFiles, setEditFiles] = useState<{ url: string; fileLabel?: string }[]>([]);

  const handleEditDli = (doc: MilestoneDocument) => {
    setEditingId(doc.id);
    setEditForm({ title: doc.title, type: doc.type as DocType });
    setEditFiles(doc.files ?? [{ url: doc.documentUrl, fileLabel: doc.fileLabel }]);
  };

  const handleRemoveEditFile = (index: number) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [savingEdit, setSavingEdit] = useState(false);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.title.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/ict/dlis/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim(),
          type: editForm.type,
          files: editFiles,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDocuments((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
        setEditingId(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update DLI');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update DLI');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteDli = async (id: string) => {
    if (!confirm('Are you sure you want to delete this DLI?')) return;
    try {
      const res = await fetch(`/api/ict/dlis/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert('Failed to delete DLI');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete DLI');
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDli, setNewDli] = useState<{ title: string; type: DocType }>({
    title: '',
    type: 'report',
  });
  const [uploadRows, setUploadRows] = useState<UploadRow[]>(() => [createUploadRow()]);
  const [uploading, setUploading] = useState(false);

  const addUploadRow = () => {
    setUploadRows((prev) => [createUploadRow(), ...prev]);
  };

  const removeUploadRow = (id: string) => {
    setUploadRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const updateUploadRow = (id: string, updates: Partial<UploadRow>) => {
    setUploadRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleAddDli = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDli.title?.trim()) return;

    const rowsWithFile = uploadRows.filter((r) => r.file);
    let filesPayload: { url: string; fileLabel?: string }[] = [];

    if (rowsWithFile.length > 0) {
      setUploading(true);
      try {
        for (const row of rowsWithFile) {
          const sigResponse = await fetch('/api/upload/signature?folder=dli');
          const sigData = await sigResponse.json();
          if (!sigData.success) throw new Error('Failed to get upload signature');

          const formData = new FormData();
          formData.append('file', row.file!);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', sigData.timestamp.toString());
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);

          const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
            { method: 'POST', body: formData }
          );

          if (!uploadResponse.ok) {
            const err = await uploadResponse.json().catch(() => ({}));
            throw new Error(err?.error?.message || 'Upload failed');
          }
          const data = await uploadResponse.json();
          filesPayload.push({ url: data.secure_url, fileLabel: row.fileLabel || undefined });
        }
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Failed to upload files. Please try again.');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const res = await fetch('/api/ict/dlis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDli.title.trim(),
          type: newDli.type,
          files: filesPayload,
        }),
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments((prev) => [doc, ...prev]);
        setNewDli({ title: '', type: 'report' });
        setUploadRows([createUploadRow()]);
        setShowAddModal(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create DLI');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create DLI');
    }
  };

  return (
    <RoleLayout
      rolePath="ict"
      roleDisplayName="ICT Officer"
      roleColor="indigo"
    >
      <div>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              DLI Milestone Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and download Digital Learning Initiative milestone documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus className="h-5 w-5" />
            Add New DLI
          </button>
        </div>

        {/* Add DLI modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[70%] max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New DLI</h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddDli} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newDli.title}
                    onChange={(e) => setNewDli((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="e.g. DLI Inception Report"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={newDli.type}
                    onChange={(e) => setNewDli((p) => ({ ...p, type: e.target.value as DocType }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>{dliTypeConfig[t].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload files
                    </label>
                    <button
                      type="button"
                      onClick={addUploadRow}
                      className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add another
                    </button>
                  </div>
                  <div className="space-y-3">
                    {uploadRows.map((row) => (
                      <div
                        key={row.id}
                        className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">File</span>
                            <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-h-[2.5rem]">
                              <Upload className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {row.file
                                  ? (() => {
                                      const ext = row.file.name.split('.').pop();
                                      return ext ? `.${ext}` : 'file';
                                    })()
                                  : 'Choose file'}
                              </span>
                              <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  updateUploadRow(row.id, {
                                    file: f || null,
                                    fileLabel: f ? f.name : '',
                                  });
                                  if (e.target) e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">File label</span>
                            <input
                              type="text"
                              value={row.fileLabel}
                              onChange={(e) => updateUploadRow(row.id, { fileLabel: e.target.value })}
                              placeholder="Auto-filled with file name when file is selected"
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400"
                            />
                          </div>
                        </div>
                        {uploadRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeUploadRow(row.id)}
                            className="p-2 h-fit text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Add DLI'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit DLI modal */}
        {editingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[70%] max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit DLI</h2>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value as DocType }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>{dliTypeConfig[t].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uploaded files
                  </label>
                  {editFiles.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-3">No files uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {editFiles.map((f, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">
                            {f.fileLabel || 'Document'}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </a>
                            <a
                              href={f.url}
                              download={f.fileLabel}
                              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditFile(index)}
                              className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingEdit ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2">Loading DLIs...</p>
            </div>
          ) : (
          <>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {doc.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {dliTypeConfig[doc.type as DocType].label}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditDli(doc)}
                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDli(doc.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {documents.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              No DLIs yet. Click &quot;Add New DLI&quot; to create one.
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </RoleLayout>
  );
}

