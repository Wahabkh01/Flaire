"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config";

export default function ListsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lists, setLists] = useState<string[]>([]);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchLists = async () => {
    try {
      const res = await fetch("http://localhost:3000/contacts/lists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLists(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleRename = async (oldName: string) => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
        const res = await fetch(
            `${API_BASE_URL}/contacts/lists/${encodeURIComponent(oldName)}`, 
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newName }),
            }
          );
          
          const result = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("Rename failed:", res.status, result);
            alert(`Error: ${res.status} - ${result.msg || "Unknown error"}`);
            return;
          }
          
      if (!res.ok) throw new Error("Failed to rename list");
      setEditingList(null);
      setNewName("");
      fetchLists();
    } catch (err) {
      console.error(err);
      alert("Error renaming list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete list "${name}" and all its contacts?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/contacts/lists/${name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete list");
      fetchLists();
    } catch (err) {
      console.error(err);
      alert("Error deleting list");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-white mb-6">📋 Contact Lists</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            {lists.length === 0 ? (
              <p className="text-white/70">No lists yet. Upload contacts to create one.</p>
            ) : (
              <ul className="space-y-3">
                {lists.map((list) => (
                  <li
                    key={list}
                    className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg"
                  >
                    {editingList === list ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                        <button
                          onClick={() => handleRename(list)}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
                        >
                          ✅ Save
                        </button>
                        <button
                          onClick={() => setEditingList(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-white">{list}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingList(list);
                              setNewName(list);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                          >
                            ✏️ Rename
                          </button>
                          <button
                            onClick={() => handleDelete(list)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
