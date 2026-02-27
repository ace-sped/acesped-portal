'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  FilePlus2,
  Users,
  Upload,
  Send,
  MessageSquare,
  Paperclip,
  CheckCircle,
  Clock3,
  Search,
} from 'lucide-react';

const CURRENT_USER_EMAIL = 'admin@aceportal.com'; // TODO: replace with authenticated user email

type User = {
  id: string;
  firstname?: string | null;
  surname?: string | null;
  email: string;
  title?: string | null;
};

type TeamMember = {
  id: string;
  name: string;
  title?: string | null;
  email: string;
};

type DocComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

type SharedDoc = {
  id: string;
  title: string;
  description: string;
  fileName?: string;
  recipients: string[];
  creatorEmail: string;
  status: 'Pending Approval' | 'Approved';
  comments: DocComment[];
  createdAt: string;
};

export default function ShareDocsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  const [docs, setDocs] = useState<SharedDoc[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFileName, setNewDocFileName] = useState<string | undefined>(undefined);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'myShares' | 'sharedWithMe'>('myShares');
  const [shareSource, setShareSource] = useState<'team' | 'users'>('team');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to load users for sharing docs', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchTeam = async () => {
      try {
        setLoadingTeam(true);
        const res = await fetch('/api/admin/team?isActive=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.team)) {
          setTeamMembers(data.team);
        }
      } catch (err) {
        console.error('Failed to load team members for sharing docs', err);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchUsers();
    fetchTeam();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchUser.toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const name = `${u.firstname || ''} ${u.surname || ''}`.toLowerCase();
      return name.includes(term) || u.email.toLowerCase().includes(term);
    });
  }, [users, searchUser]);

  const filteredTeam = useMemo(() => {
    const term = searchUser.toLowerCase();
    if (!term) return teamMembers;
    return teamMembers.filter((t) => {
      const name = (t.name || '').toLowerCase();
      const title = (t.title || '').toLowerCase();
      return name.includes(term) || title.includes(term) || t.email.toLowerCase().includes(term);
    });
  }, [teamMembers, searchUser]);

  const sortedFiltered = useMemo(() => {
    const list =
      shareSource === 'team'
        ? filteredTeam.map((t) => ({
            id: t.id,
            email: t.email,
            name: t.name,
            title: t.title || '',
          }))
        : filteredUsers.map((u) => ({
            id: u.id,
            email: u.email,
            name: `${u.firstname || ''} ${u.surname || ''}`.trim(),
            title: u.title || '',
          }));

    return list.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      const titleA = a.title || '';
      const titleB = b.title || '';

      if (nameA && nameB) {
        const cmp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        if (cmp !== 0) return cmp;
      } else if (nameA || nameB) {
        return nameA ? -1 : 1;
      }

      if (titleA || titleB) {
        const cmpTitle = titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
        if (cmpTitle !== 0) return cmpTitle;
      }

      return a.email.localeCompare(b.email, undefined, { sensitivity: 'base' });
    });
  }, [filteredTeam, filteredUsers, shareSource]);

  const toggleRecipient = (email: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(email) ? prev.filter((r) => r !== email) : [...prev, email]
    );
  };

  const toggleAllRecipients = () => {
    const list = sortedFiltered;
    if (selectedRecipients.length === list.length && list.length > 0) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(list.map((u) => u.email));
    }
  };

  const handleFileChange = (file?: File | null) => {
    if (file) {
      setNewDocFileName(file.name);
    } else {
      setNewDocFileName(undefined);
    }
  };

  const handleCreateShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    if (selectedRecipients.length === 0) return;

    setSubmitting(true);
    const now = new Date().toISOString();
    const newDoc: SharedDoc = {
      id: crypto.randomUUID(),
      title: newDocTitle.trim(),
      description: newDocDesc.trim(),
      fileName: newDocFileName,
      recipients: selectedRecipients,
      creatorEmail: CURRENT_USER_EMAIL,
      status: 'Pending Approval',
      comments: [],
      createdAt: now,
    };

    setDocs((prev) => [newDoc, ...prev]);
    setNewDocTitle('');
    setNewDocDesc('');
    setNewDocFileName(undefined);
    setSelectedRecipients([]);
    setSubmitting(false);
  };

  const addComment = (docId: string) => {
    const text = (commentInputs[docId] || '').trim();
    if (!text) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              comments: [
                ...d.comments,
                {
                  id: crypto.randomUUID(),
                  author: 'You',
                  content: text,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : d
      )
    );
    setCommentInputs((prev) => ({ ...prev, [docId]: '' }));
  };

  const myShares = docs.filter((d) => d.creatorEmail === CURRENT_USER_EMAIL);
  const sharedWithMe = docs.filter(
    (d) => d.creatorEmail !== CURRENT_USER_EMAIL && d.recipients.includes(CURRENT_USER_EMAIL)
  );
  const visibleDocs = activeTab === 'myShares' ? myShares : sharedWithMe;

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Share Docs</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share documents with selected members for approvals and comments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Create share form */}
          <div className="xl:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <FilePlus2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                New Document Share
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleCreateShare}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Procurement Approval - Q1 Budget"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Context, what approval is needed, due dates, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attach File (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Upload className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {newDocFileName || 'Choose file'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                  </label>
                  {newDocFileName && (
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Share with <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shareSource"
                      value="team"
                      checked={shareSource === 'team'}
                      onChange={() => {
                        setShareSource('team');
                        setSelectedRecipients([]);
                      }}
                      className="h-4 w-4 text-green-600 border-gray-300"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Team members</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shareSource"
                      value="users"
                      checked={shareSource === 'users'}
                      onChange={() => {
                        setShareSource('users');
                        setSelectedRecipients([]);
                      }}
                      className="h-4 w-4 text-green-600 border-gray-300"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Users</span>
                  </label>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                      checked={sortedFiltered.length > 0 && selectedRecipients.length === sortedFiltered.length}
                      onChange={toggleAllRecipients}
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {shareSource === 'team' ? 'All Team' : 'All Users'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedRecipients.length} selected
                  </p>
                </div>
                <div className="mb-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder={shareSource === 'team' ? 'Search team members' : 'Search users'}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {loadingUsers || loadingTeam ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading members...</p>
                  ) : sortedFiltered.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No members found.</p>
                  ) : (
                    sortedFiltered.map((u) => {
                      const label = u.name || u.title || u.email;
                      const checked = selectedRecipients.includes(u.email);
                      return (
                        <label
                          key={u.id}
                          className="flex items-start gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded"
                            checked={checked}
                            onChange={() => toggleRecipient(u.email)}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !newDocTitle.trim() || selectedRecipients.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                Share Document
              </button>
            </form>
          </div>

          {/* Shared docs list */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('myShares')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  activeTab === 'myShares'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                My Shares ({myShares.length})
              </button>
              <button
                onClick={() => setActiveTab('sharedWithMe')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  activeTab === 'sharedWithMe'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Shared With Me ({sharedWithMe.length})
              </button>
            </div>

            {visibleDocs.length === 0 ? (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-center p-8">
                <Paperclip className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                  {activeTab === 'myShares'
                    ? 'No shared documents yet'
                    : 'No documents have been shared with you'}
                </p>
                {activeTab === 'myShares' ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create a share and add recipients to start a review thread.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    When a teammate shares a document with you, it will appear here.
                  </p>
                )}
              </div>
            ) : (
              visibleDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex flex-wrap gap-2 items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            doc.status === 'Pending Approval'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      {doc.fileName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Paperclip className="h-4 w-4" />
                          {doc.fileName}
                        </p>
                      )}
                      {doc.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {doc.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        Shared {new Date(doc.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1">
                      <Users className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Recipients</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {doc.recipients.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Comments
                      </p>
                    </div>
                    <div className="space-y-3">
                      {doc.comments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No comments yet.
                        </p>
                      ) : (
                        doc.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">{c.author}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                              {c.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[doc.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [doc.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Add a comment for the recipients"
                      />
                      <button
                        onClick={() => addComment(doc.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

