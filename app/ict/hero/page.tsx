"use client";

import React, { useEffect, useState } from "react";
import RoleLayout from "../../components/shared/RoleLayout";
import { Image as ImageIcon, Plus, Edit, Trash2, X, Check, AlertCircle, Upload } from "lucide-react";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  displayOrder: number;
  isActive: boolean;
};

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  ctaPrimaryText: "",
  ctaPrimaryHref: "",
  ctaSecondaryText: "",
  ctaSecondaryHref: "",
  displayOrder: 0,
  isActive: true,
};

export default function HeroManagementPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ict/hero");
      const data = await res.json();
      if (data.success) setSlides(data.slides || []);
      else showMessage("error", data.message || "Failed to fetch hero slides");
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to fetch hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || "",
      description: slide.description,
      image: slide.image,
      ctaPrimaryText: slide.ctaPrimaryText || "",
      ctaPrimaryHref: slide.ctaPrimaryHref || "",
      ctaSecondaryText: slide.ctaSecondaryText || "",
      ctaSecondaryHref: slide.ctaSecondaryHref || "",
      displayOrder: slide.displayOrder || 0,
      isActive: slide.isActive,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    setLoading(true);
    try {
      const res = await fetch("/api/upload/service-hero", {
        method: "POST",
        body: data,
      });
      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : { success: false, message: await res.text() };

      if (payload.success) {
        // uploadFile() returns { success, path, message }
        const imageUrl = payload.path || payload.file?.url || payload.url || "";
        if (!imageUrl) {
          showMessage("error", "Upload succeeded but no image URL was returned");
          return;
        }
        setForm((prev) => ({ ...prev, image: imageUrl }));
        showMessage("success", "Image uploaded");
      } else {
        showMessage("error", payload.message || "Failed to upload image");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/ict/hero", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("success", editing ? "Hero slide updated" : "Hero slide created");
        setSlides(data.slides || []);
        setShowModal(false);
        resetForm();
      } else {
        showMessage("error", data.message || "Failed to save hero slide");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to save hero slide");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!confirm(`Delete "${slide.title}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ict/hero?id=${slide.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSlides(data.slides || []);
        showMessage("success", "Hero slide deleted");
      } else {
        showMessage("error", data.message || "Failed to delete hero slide");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to delete hero slide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout rolePath="ict" roleDisplayName="ICT" roleColor="blue">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Hero</h1>
            <p className="text-gray-600 dark:text-gray-400">Create, edit and order homepage hero slides</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}>
            {message.type === "success" ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading && slides.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading hero slides...</div>
          ) : slides.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No hero slides yet.</div>
          ) : (
            slides.map((slide) => (
              <div key={slide.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-900">
                  {slide.image ? (
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{slide.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${slide.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{slide.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Order: {slide.displayOrder ?? 0}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(slide)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(slide)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? "Edit Hero Slide" : "Add Hero Slide"}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hero Image *</label>
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                      {form.image ? (
                        <img src={form.image} alt="Hero preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        id="hero-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                      <label htmlFor="hero-image-upload" className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Title *</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Subtitle</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.subtitle} onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Description *</label>
                  <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Primary CTA Text</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.ctaPrimaryText} onChange={(e) => setForm((prev) => ({ ...prev, ctaPrimaryText: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Primary CTA Link</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.ctaPrimaryHref} onChange={(e) => setForm((prev) => ({ ...prev, ctaPrimaryHref: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Secondary CTA Text</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.ctaSecondaryText} onChange={(e) => setForm((prev) => ({ ...prev, ctaSecondaryText: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Secondary CTA Link</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.ctaSecondaryHref} onChange={(e) => setForm((prev) => ({ ...prev, ctaSecondaryHref: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Display Order</label>
                    <input type="number" min={0} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" value={form.displayOrder} onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                  <div className="flex items-center pt-6">
                    <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4" />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active slide</label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                    {loading ? "Saving..." : editing ? "Update Slide" : "Create Slide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
