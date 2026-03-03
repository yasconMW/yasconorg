"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CMS_CATEGORIES,
  CMS_CONTENT_TYPES,
  CMS_LEVELS,
  CMS_REGIONS,
  type CmsCategory,
  type CmsContentType,
  type CmsLevel,
  type CmsRegion,
  type CmsRole,
  type CmsUserRecord,
} from "@/lib/cms/constants";

type ContentItem = {
  id: number;
  title: string;
  slug: string;
  content_type: CmsContentType;
  category: CmsCategory;
  level: CmsLevel;
  region: CmsRegion | null;
  body: string;
  updated_at: string;
};

type Props = {
  initialUser: CmsUserRecord;
};

export default function CmsClient({ initialUser }: Props) {
  const [user, setUser] = useState(initialUser);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<CmsUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [contentType, setContentType] = useState<CmsContentType>("news");
  const [category, setCategory] = useState<CmsCategory>("news");
  const [level, setLevel] = useState<CmsLevel>(
    user.role === "super_admin" ? "national" : "regional"
  );
  const [region, setRegion] = useState<CmsRegion>(
    user.role === "super_admin" ? "central" : user.region
  );
  const [body, setBody] = useState("");

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<CmsRole>("regional_admin");
  const [newUserRegion, setNewUserRegion] = useState<CmsRegion>("central");

  const canManageUsers = useMemo(() => user.role === "super_admin", [user.role]);

  useEffect(() => {
    void refreshMe();
    void refreshContent();
    if (canManageUsers) {
      void refreshUsers();
    }
  }, [canManageUsers]);

  async function refreshMe() {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      window.location.href = "/dashboard/login";
      return;
    }
    const data = (await res.json()) as { user: CmsUserRecord };
    setUser(data.user);
  }

  async function refreshContent() {
    setLoading(true);
    const res = await fetch("/api/cms/content");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "Unable to load content.");
      return;
    }
    setItems(data.items || []);
  }

  async function refreshUsers() {
    const res = await fetch("/api/cms/users");
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Unable to load users.");
      return;
    }
    setUsers(data.items || []);
  }

  function resetContentForm() {
    setTitle("");
    setSlug("");
    setContentType("news");
    setCategory("news");
    setLevel(user.role === "super_admin" ? "national" : "regional");
    setRegion(user.role === "super_admin" ? "central" : user.region);
    setBody("");
    setEditingId(null);
  }

  async function submitContent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const payload = {
      title,
      slug,
      contentType,
      category,
      level,
      region,
      body,
    };

    const res = await fetch(
      editingId ? `/api/cms/content/${editingId}` : "/api/cms/content",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Unable to save content.");
      return;
    }

    setMessage(editingId ? "Content updated." : "Content created.");
    resetContentForm();
    await refreshContent();
  }

  function beginEdit(item: ContentItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setContentType(item.content_type);
    setCategory(item.category);
    setLevel(item.level);
    setRegion(item.region ?? (user.region === "national" ? "central" : user.region));
    setBody(item.body);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeContent(id: number) {
    const ok = window.confirm("Delete this record?");
    if (!ok) return;
    const res = await fetch(`/api/cms/content/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Unable to delete.");
      return;
    }
    await refreshContent();
  }

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/cms/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        region: newUserRegion,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Unable to create user.");
      return;
    }
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("regional_admin");
    setNewUserRegion("central");
    setMessage("User created.");
    await refreshUsers();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/dashboard/login";
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a2e1a]">Content Management</h1>
            <p className="text-sm text-[#4a5a4a] mt-1">
              Signed in as {user.name} ({user.role}, {user.region})
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-[#1a2e1a] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#2d4a2d]"
          >
            Sign out
          </button>
        </div>

        {message && (
          <div className="mb-6 p-3 rounded-md bg-[#fff8e1] text-[#5f4b00] border border-[#f1d995] text-sm">
            {message}
          </div>
        )}

        <section className="bg-white border border-[#ede8d8] rounded-md p-5 mb-8">
          <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">
            {editingId ? "Edit Content" : "Create Content"}
          </h2>
          <form onSubmit={submitContent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="optional-auto-generated"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as CmsContentType)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {CMS_CONTENT_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CmsCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {CMS_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CmsLevel)}
                disabled={user.role !== "super_admin"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                {CMS_LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as CmsRegion)}
                disabled={user.role !== "super_admin" || level === "national"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                {CMS_REGIONS.filter((r) => r !== "national").map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700"
              >
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetContentForm}
                  className="bg-gray-200 text-gray-900 px-5 py-2 rounded-md font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-white border border-[#ede8d8] rounded-md p-5 mb-8">
          <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">Content Records</h2>
          {loading ? (
            <p className="text-sm text-[#4a5a4a]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#4a5a4a]">No records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Slug</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Level</th>
                    <th className="py-2 pr-4">Region</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{item.title}</td>
                      <td className="py-2 pr-4">{item.slug}</td>
                      <td className="py-2 pr-4">{item.content_type}</td>
                      <td className="py-2 pr-4">{item.category}</td>
                      <td className="py-2 pr-4">{item.level}</td>
                      <td className="py-2 pr-4">{item.region ?? "-"}</td>
                      <td className="py-2 flex gap-2">
                        <button
                          onClick={() => beginEdit(item)}
                          className="text-green-700 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeContent(item.id)}
                          className="text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {canManageUsers && (
          <section className="bg-white border border-[#ede8d8] rounded-md p-5">
            <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">User Management</h2>
            <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
              <input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
                placeholder="Name"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                placeholder="Email"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                placeholder="Password"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as CmsRole)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="regional_admin">regional_admin</option>
                <option value="super_admin">super_admin</option>
              </select>
              <select
                value={newUserRegion}
                onChange={(e) => setNewUserRegion(e.target.value as CmsRegion)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {CMS_REGIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="md:col-span-5 bg-[#1a2e1a] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#2d4a2d]"
              >
                Create User
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Region</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{row.name}</td>
                      <td className="py-2 pr-4">{row.email}</td>
                      <td className="py-2 pr-4">{row.role}</td>
                      <td className="py-2 pr-4">{row.region}</td>
                      <td className="py-2 pr-4">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

