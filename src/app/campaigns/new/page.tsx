"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import Header from "@/components/Header";   // ✅ adjust path if different
import Sidebar from "@/components/Sidebar"; // ✅ adjust path if different
import { API_BASE_URL } from "@/config";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewCampaignPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch available lists
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/contacts/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLists(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLists();
  }, []);

  // Fetch contacts for selected list
  useEffect(() => {
    if (!selectedList) {
      setContacts([]);
      return;
    }
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/contacts/by-list/${selectedList}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContacts();
  }, [selectedList]);

  // Handle campaign creation
  const handleSubmit = async (sendNow = false, isDraft = false) => {
    if (!subject || !body || contacts.length === 0) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const personalizedEmails = contacts.map((c) => ({
        email: c.email,
        body: body.replaceAll("{Name}", c.firstName),
      }));

      const newStatus = isDraft ? "draft" : (sendNow ? "sending" : (scheduledAt ? "scheduled" : "draft"));

      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          body,
          recipients: personalizedEmails,
          scheduledAt: isDraft ? null : sendNow ? new Date().toISOString() : scheduledAt || null,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");
      router.push("/campaigns");
    } catch (err) {
      console.error(err);
      alert("Error creating campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all">
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Create New Campaign
            </h1>
            <p className="text-white/70">Design and launch your email marketing campaign</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Campaign Form */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">⚙️</span>
                Campaign Settings
              </h2>

              <div className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* List Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Select Contact List</label>
                  <select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="" className="bg-slate-800">-- Select a list --</option>
                    {lists.map((list) => (
                      <option key={list} value={list} className="bg-slate-800">
                        {list}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contacts Preview */}
                {contacts.length > 0 && (
                  <div className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                    <div className="bg-white/10 px-4 py-3">
                      <h3 className="text-white font-medium">Selected Contacts ({contacts.length})</h3>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-4 py-2 text-left text-white/80">First Name</th>
                            <th className="px-4 py-2 text-left text-white/80">Last Name</th>
                            <th className="px-4 py-2 text-left text-white/80">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {contacts.slice(0, 10).map((c, i) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="px-4 py-2 text-white/90">{c.firstName}</td>
                              <td className="px-4 py-2 text-white/90">{c.lastName}</td>
                              <td className="px-4 py-2 text-white/70">{c.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {contacts.length > 10 && (
                        <div className="px-4 py-2 text-center text-white/60 text-sm bg-white/5">
                          +{contacts.length - 10} more contacts...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Schedule Delivery</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-white/60 text-sm mt-1">Leave empty to save as draft</p>
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email Content</label>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                    <RichTextEditor value={body} onChange={setBody} />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-white/60">
                    <span className="mr-2">💡</span>
                    Use <code className="bg-white/20 px-1 rounded text-cyan-300">{'{Name}'}</code> to personalize with recipient's name
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleSubmit(false, false)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📋</span>
                        Create Campaign
                      </>
                    )}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit(true, false)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    <span className="mr-2">🚀</span>
                    Send Now
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(false, true)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    <span className="mr-2">📄</span>
                    Save as Draft
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-2">👀</span>
                  Preview Email
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 sticky top-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">👀</span>
                Live Preview
              </h2>

              {contacts.length === 0 ? (
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4 opacity-50">📧</div>
                    <p className="text-white/60 mb-4">Select a contact list to see preview</p>
                    <div className="text-left">
                      <p className="font-bold text-white mb-2">{subject || "No subject yet"}</p>
                      <div 
                        className="prose prose-invert max-w-none text-white/80" 
                        dangerouslySetInnerHTML={{ __html: body || "<p>No content yet</p>" }} 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-gray-100 px-6 py-4 border-b">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        <span className="font-medium">To:</span> {contacts[0].email}
                      </div>
                      <div className="text-xs">Live Preview</div>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-gray-800 text-lg">
                        {subject || "No subject yet"}
                      </span>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 bg-white max-h-96 overflow-y-auto">
                    <div 
                      className="prose max-w-none text-gray-800" 
                      dangerouslySetInnerHTML={{ 
                        __html: (body || "<p>No content yet</p>").replaceAll("{Name}", contacts[0]?.firstName || "there") 
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-slide-up">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-3">📧</div>
                <h2 className="text-2xl font-bold text-white">Email Preview</h2>
              </div>
              
              {contacts.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/80 mb-2">
                      <strong className="text-white">To:</strong> {contacts[0].firstName}{" "}
                      {contacts[0].lastName} ({contacts[0].email})
                    </p>
                    <p className="text-white/80 mb-2">
                      <strong className="text-white">Subject:</strong> {subject}
                    </p>
                  </div>
                  <div
                    className="bg-white rounded-xl p-6 min-h-[200px] shadow-inner"
                    dangerouslySetInnerHTML={{
                      __html: body.replaceAll("{Name}", contacts[0].firstName),
                    }}
                  />
                  <p className="text-white/60 text-sm bg-white/5 rounded-lg p-3 border border-white/10">
                    💡 Showing preview for first contact. All {contacts.length} contacts will receive personalized versions.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🤷‍♀️</div>
                  <p className="text-white/70">No contacts selected yet.</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      </main>
      </div>
    </div>
  );
}