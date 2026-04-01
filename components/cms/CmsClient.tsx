"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardSidebar from "@/components/cms/DashboardSidebar";
import UnifiedContentForm, { type ContentFormData } from "@/components/cms/UnifiedContentForm";
import { type CmsUserRecord } from "@/lib/cms/constants";
import {
  FileText, MapPin, User, CheckCircle, Trash2, Edit, Eye,
  EyeOff, Plus, ArrowUp, ArrowDown, Save, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContentItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  richContent: string;
  contentType: string;
  region: string;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
  coverImage: string | null;
  videoUrl?: string;
  createdBy: { name: string };
}

interface HeroSlide {
  id: string;
  label: string;
  heading: string;
  sub: string;
  bg: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
  order: number;
  active: boolean;
}

const REGIONS = ["national", "central", "northern", "southern", "eastern"];
const TYPE_MAP: Record<string, string> = {
  news: "news", announcement: "announcements", press_briefing: "press-briefings",
  blog: "blogs", video: "videos",
};
const TYPE_LABEL: Record<string, string> = {
  news: "News", announcement: "Announcement", press_briefing: "Press Briefing",
  blog: "Blog", video: "Video",
};
const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-slate-100 text-slate-700",
};

// ── Alert helper ──────────────────────────────────────────────────────────────
function Alert({ msg, type, onDismiss }: { msg: string; type: "success" | "error"; onDismiss: () => void }) {
  return (
    <div className={`mb-6 p-4 rounded-lg border flex items-start justify-between gap-4 ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onDismiss} className="flex-shrink-0 text-slate-500 hover:text-slate-700"><X size={16} /></button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CmsClient({ initialUser }: { initialUser: CmsUserRecord }) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState("overview");
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<CmsUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage tab
  const [typeFilter, setTypeFilter] = useState("all");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);

  // Hero slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSaving, setHeroSaving] = useState(false);

  // User form
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "regional_admin" as const, region: "national" });
  const [editingUser, setEditingUser] = useState<CmsUserRecord | null>(null);

  const canManageUsers = useMemo(() => user.role === "super_admin", [user.role]);

  const showMsg = (text: string, type: "success" | "error" = "success") => setMsg({ text, type });

  // ── Data fetching ──────────────────────────────────────────────────────────
  const refreshContent = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetch("/api/cms/announcements?status=all").then((r) => r.json()),
        fetch("/api/cms/news?status=all").then((r) => r.json()),
        fetch("/api/cms/press-briefings?status=all").then((r) => r.json()),
        fetch("/api/cms/videos?status=all").then((r) => r.json()),
        fetch("/api/cms/blogs?status=all").then((r) => r.json()),
      ]);
      const [ann, news, brief, vids, blogs] = results.map((r) => (r.status === "fulfilled" ? r.value : []));
// Deduplicate by contentType + id, keep latest
      const allItemsMap = new Map<string, ContentItem>();
      [...ann.map((x: ContentItem) => ({ ...x, contentType: "announcement" as const })),
       ...news.map((x: ContentItem) => ({ ...x, contentType: "news" as const })),
       ...brief.map((x: ContentItem) => ({ ...x, contentType: "press_briefing" as const })),
       ...vids.map((x: ContentItem) => ({ ...x, contentType: "video" as const })),
       ...blogs.map((x: ContentItem) => ({ ...x, contentType: "blog" as const }))].forEach(item => {
        const key = `${item.contentType}-${item.id}`;
        allItemsMap.set(key, item); // overwrite, keeps last
      });
      const merged: ContentItem[] = Array.from(allItemsMap.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setAllContent(merged);
    } catch { showMsg("Failed to load content", "error"); }
    finally { setLoading(false); }
  }, []);

  const refreshUsers = useCallback(async () => {
    const res = await fetch("/api/cms/users");
    const data = await res.json();
    if (res.ok) setUsers(data.items || []);
  }, []);

  const refreshHeroSlides = useCallback(async () => {
    try {
      const res = await fetch("/api/cms/hero-slides");
      if (res.ok) {
        const data = await res.json();
        setHeroSlides(data);
      }
    } catch { /* hero slides are optional */ }
  }, []);

  useEffect(() => {
    void refreshContent();
    if (canManageUsers) void refreshUsers();
    void refreshHeroSlides();
  }, [refreshContent, refreshUsers, refreshHeroSlides, canManageUsers]);

  // ── Content CRUD ───────────────────────────────────────────────────────────
  async function handleContentSubmit(data: ContentFormData) {
    setIsSubmitting(true);
    try {
      const endpoint = `/api/cms/${TYPE_MAP[data.contentType] || "news"}${editItem ? `/${editItem.id}` : ""}`;
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImage: data.coverImage || null,
          videoUrl: data.videoUrl || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) { showMsg(result.error || "Save failed", "error"); return; }
      showMsg(editItem ? "Content updated!" : "Content created!");
      setEditItem(null);
      setActiveTab("manage");
      await refreshContent();
    } catch { showMsg("An error occurred", "error"); }
    finally { setIsSubmitting(false); }
  }

  async function deleteContent(id: number, type: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    const res = await fetch(`/api/cms/${TYPE_MAP[type]}/${id}`, { method: "DELETE" });
    if (res.ok) { showMsg("Deleted."); await refreshContent(); }
    else showMsg("Delete failed", "error");
  }

  async function toggleStatus(item: ContentItem) {
    const newStatus = item.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/cms/${TYPE_MAP[item.contentType]}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { showMsg(`Status set to ${newStatus}.`); await refreshContent(); }
    else showMsg("Failed to update status", "error");
  }

  function startEdit(item: ContentItem) {
    setEditItem(item);
    setActiveTab("create");
  }

  // ── Hero Slides ────────────────────────────────────────────────────────────
  function addSlide() {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`, label: "New Slide", heading: "Heading here",
      sub: "Subtitle here.", bg: "/hero/hero4.png",
      cta1Label: "Learn More", cta1Href: "/about",
      cta2Label: "Get Involved", cta2Href: "/get-involved",
      order: heroSlides.length, active: true,
    };
    setHeroSlides((prev) => [...prev, newSlide]);
  }

  function updateSlide(id: string, field: keyof HeroSlide, value: string | boolean | number) {
    setHeroSlides((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function moveSlide(id: string, dir: "up" | "down") {
    setHeroSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  async function saveHeroSlides() {
    setHeroSaving(true);
    try {
      const res = await fetch("/api/cms/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroSlides),
      });
      if (res.ok) showMsg("Hero slides saved!");
      else showMsg("Failed to save hero slides", "error");
    } finally { setHeroSaving(false); }
  }

  // ── Users CRUD ─────────────────────────────────────────────────────────────
  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const res = await fetch(`/api/cms/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userForm.name, role: userForm.role, region: userForm.region, ...(userForm.password ? { password: userForm.password } : {}) }),
        });
        const data = await res.json();
        if (!res.ok) { showMsg(data.error || "Update failed", "error"); return; }
        showMsg("User updated!");
        setEditingUser(null);
      } else {
        const res = await fetch("/api/cms/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userForm),
        });
        const data = await res.json();
        if (!res.ok) { showMsg(data.error || "Create failed", "error"); return; }
        showMsg("User created!");
      }
      setUserForm({ name: "", email: "", password: "", role: "regional_admin", region: "national" });
      await refreshUsers();
    } finally { setIsSubmitting(false); }
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/cms/users/${id}`, { method: "DELETE" });
    if (res.ok) { showMsg("User deleted."); await refreshUsers(); }
    else showMsg("Delete failed", "error");
  }

  function startEditUser(u: CmsUserRecord) {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: "", role: u.role as typeof userForm.role, region: u.region });
  }

  // ── Filtered content ───────────────────────────────────────────────────────
  const filtered = typeFilter === "all" ? allContent : allContent.filter((i) => i.contentType === typeFilter);

  // ── Stats for overview ────────────────────────────────────────────────────
  const stats = {
    total: allContent.length,
    published: allContent.filter((i) => i.status === "published").length,
    draft: allContent.filter((i) => i.status === "draft").length,
  };

  return (
    <div className="flex min-h-screen mt-8 bg-slate-50">
      <DashboardSidebar
        user={user} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setEditItem(null); }}
        onLogout={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/dashboard/login"; }}
        canManageUsers={canManageUsers}
      />

      <main className="flex-1 md:ml-64 pt-16 p-6 mt-7 md:p-8">
        {msg && <Alert msg={msg.text} type={msg.type} onDismiss={() => setMsg(null)} />}

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600 mb-8">Welcome back, {user.name}.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Content", value: stats.total, color: "bg-blue-50 border-blue-200" },
                { label: "Published", value: stats.published, color: "bg-emerald-50 border-emerald-200" },
                { label: "Drafts", value: stats.draft, color: "bg-amber-50 border-amber-200" },
                { label: "Region", value: user.region.charAt(0).toUpperCase() + user.region.slice(1), color: "bg-purple-50 border-purple-200" },
              ].map((s) => (
                <div key={s.label} className={`border rounded-xl p-5 ${s.color}`}>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Recent content */}
            <h2 className="text-lg font-bold text-slate-800 mb-3">Recent Content</h2>
            <div className="space-y-3">
{allContent.slice(0, 5).map((item, index) => (
                <div key={`${item.contentType}-${item.id}-${item.slug || index}`} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{TYPE_LABEL[item.contentType] || item.contentType}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLE[item.status] || STATUS_STYLE.draft}`}>{item.status}</span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                  </div>
                  <button onClick={() => startEdit(item)} className="flex-shrink-0 text-blue-600 hover:text-blue-800 p-1">
                    <Edit size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Create / Edit ── */}
        {activeTab === "create" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              {editItem && (
                <button onClick={() => { setEditItem(null); }} className="text-slate-500 hover:text-slate-700">
                  <X size={20} />
                </button>
              )}
              <h1 className="text-3xl font-bold text-slate-900">
                {editItem ? `Editing: ${editItem.title.slice(0, 40)}${editItem.title.length > 40 ? "…" : ""}` : "Create New Content"}
              </h1>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <UnifiedContentForm
                regions={REGIONS}
                onSubmit={handleContentSubmit}
                isLoading={isSubmitting}
                mode={editItem ? "edit" : "create"}
                initialData={editItem ? {
                  id: editItem.id,
                  contentType: editItem.contentType,
                  title: editItem.title,
                  excerpt: editItem.excerpt,
                  richContent: editItem.richContent,
                  region: editItem.region,
                  status: editItem.status,
                  coverImage: editItem.coverImage || "",
                  videoUrl: editItem.videoUrl || "",
                } : undefined}
              />
            </div>
          </div>
        )}

        {/* ── Manage ── */}
        {activeTab === "manage" && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Manage Content</h1>
              <button onClick={() => { setEditItem(null); setActiveTab("create"); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm">
                <Plus size={16} /> New Content
              </button>
            </div>

            {/* Filter */}
            <div className="mb-5 flex flex-wrap gap-2">
              {["all", "news", "announcement", "press_briefing", "blog", "video"].map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${typeFilter === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"}`}>
                  {t === "all" ? "All" : TYPE_LABEL[t] || t}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse h-20 bg-white border border-slate-200 rounded-lg" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>No content yet. <button onClick={() => setActiveTab("create")} className="text-blue-600 font-semibold hover:underline">Create some</button></p>
              </div>
            ) : (
              <div className="space-y-3">
{filtered.map((item, index) => (
                  <div key={`${item.contentType}-${item.id}-${item.slug || index}`}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
                            {TYPE_LABEL[item.contentType] || item.contentType}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLE[item.status] || STATUS_STYLE.draft}`}>
                            {item.status}
                          </span>
                          <span className="text-xs text-slate-400 capitalize">· {item.region}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.excerpt}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.createdBy.name} · {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => toggleStatus(item)} title={item.status === "published" ? "Unpublish" : "Publish"}
                          className={`p-2 rounded-lg border transition-colors ${item.status === "published" ? "border-emerald-300 text-emerald-600 hover:bg-emerald-50" : "border-slate-300 text-slate-500 hover:bg-slate-50"}`}>
                          {item.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => startEdit(item)}
                          className="p-2 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteContent(item.id, item.contentType)}
                          className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Hero Slides ── */}
        {activeTab === "hero" && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Hero Slides</h1>
                <p className="text-slate-500 text-sm mt-1">Manage homepage hero carousel content</p>
              </div>
              <div className="flex gap-3">
                <button onClick={addSlide} className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 font-semibold text-sm text-slate-700">
                  <Plus size={16} /> Add Slide
                </button>
                <button onClick={saveHeroSlides} disabled={heroSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:bg-slate-400">
                  <Save size={16} /> {heroSaving ? "Saving…" : "Save All"}
                </button>
              </div>
            </div>

            {heroSlides.length === 0 ? (
              <div className="text-center py-16 text-slate-500 bg-white border border-slate-200 rounded-xl">
                <p className="mb-3">No slides yet. The site uses built-in fallback slides.</p>
                <button onClick={addSlide} className="text-blue-600 font-semibold hover:underline">Add first slide</button>
              </div>
            ) : (
              <div className="space-y-4">
                {heroSlides.map((slide, idx) => (
                  <div key={slide.id} className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-500">SLIDE {idx + 1}</span>
                      <div className="flex gap-2">
                        <button onClick={() => moveSlide(slide.id, "up")} disabled={idx === 0} className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"><ArrowUp size={14} /></button>
                        <button onClick={() => moveSlide(slide.id, "down")} disabled={idx === heroSlides.length - 1} className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"><ArrowDown size={14} /></button>
                        <button onClick={() => updateSlide(slide.id, "active", !slide.active)}
                          className={`px-3 py-1 rounded text-xs font-semibold border ${slide.active ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-50 border-slate-300 text-slate-500"}`}>
                          {slide.active ? "Active" : "Hidden"}
                        </button>
                        <button onClick={() => setHeroSlides((p) => p.filter((s) => s.id !== slide.id))}
                          className="p-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["label", "heading", "sub", "bg", "cta1Label", "cta1Href", "cta2Label", "cta2Href"] as (keyof HeroSlide)[]).map((field) => (
                        <div key={field} className={field === "sub" || field === "heading" ? "md:col-span-2" : ""}>
                          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{field}</label>
                          {field === "sub" || field === "heading" ? (
                            <textarea rows={field === "sub" ? 3 : 2} value={String(slide[field])}
                              onChange={(e) => updateSlide(slide.id, field, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                          ) : (
                            <input type="text" value={String(slide[field])}
                              onChange={(e) => updateSlide(slide.id, field, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === "users" && canManageUsers && (
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Manage Users</h1>

            <div className="bg-white border border-slate-200 rounded-xl p-8 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                {editingUser ? `Editing: ${editingUser.name}` : "Create New User"}
              </h2>
              <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Full Name"
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} required={!editingUser} placeholder="Email"
                  disabled={!!editingUser}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100" />
                <input type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} required={!editingUser}
                  placeholder={editingUser ? "New password (leave blank to keep)" : "Password"}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as typeof userForm.role }))}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="regional_admin">Regional Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <select value={userForm.region} onChange={(e) => setUserForm((p) => ({ ...p, region: e.target.value }))}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {REGIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 font-semibold">
                    {isSubmitting ? "Saving…" : editingUser ? "Update User" : "Create User"}
                  </button>
                  {editingUser && (
                    <button type="button" onClick={() => { setEditingUser(null); setUserForm({ name: "", email: "", password: "", role: "regional_admin", region: "national" }); }}
                      className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-slate-700">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">All Users ({users.length})</h2>
              </div>
              {users.length === 0 ? (
                <p className="p-6 text-slate-500">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {["Name", "Email", "Role", "Region", "Created", "Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 font-semibold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4 capitalize">{u.role.replace("_", " ")}</td>
                          <td className="py-3 px-4 capitalize">{u.region}</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => startEditUser(u)} className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50"><Edit size={14} /></button>
                              {u.id !== user.id && (
                                <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
