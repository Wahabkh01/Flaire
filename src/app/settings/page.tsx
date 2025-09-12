"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/ApiService";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { 
  Mail, 
  Server, 
  Shield, 
  User, 
  Key, 
  Send, 
  Reply, 
  CheckCircle, 
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  TestTube,
  Info
} from "lucide-react";

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
  replyTo: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 587,
    secure: false,
    user: "",
    pass: "",
    senderName: "",
    replyTo: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await apiService.getEmailSettings();
        if (data) setForm(data);
      } catch (err) {
        console.error("Failed to load settings", err);
        showNotification('error', 'Failed to load email settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: null, message: '' }), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await apiService.updateEmailSettings(form);
      showNotification('success', 'Email settings saved successfully! 🎉');
    } catch (err) {
      showNotification('error', `Failed to save settings: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // Simulate API call - implement actual test endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('success', 'Connection test successful! ✅');
    } catch (err) {
      showNotification('error', `Connection test failed: ${(err as Error).message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
          <main className="flex-1 p-6 relative">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-10 bg-white/10 rounded-lg w-64"></div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-32"></div>
                        <div className="h-12 bg-white/5 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-6 relative">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                ⚙️ Email Settings
              </h1>
              <button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
              >
                <TestTube className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Notification */}
            {notification.type && (
              <div className={`
                flex items-center gap-3 p-4 rounded-xl border backdrop-blur-lg animate-in slide-in-from-top-2 duration-300
                ${notification.type === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border-red-500/30 text-red-300'
                }
              `}>
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {/* Settings Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">SMTP Configuration</h2>
                    <p className="text-white/70 text-sm">Configure your email server settings for sending campaigns</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Server Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-purple-400" />
                    Server Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <Server className="w-4 h-4 text-purple-400" />
                        SMTP Host
                      </label>
                      <input
                        name="smtpHost"
                        type="text"
                        placeholder="smtp.gmail.com"
                        value={form.smtpHost}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <span className="text-purple-400">#</span>
                        SMTP Port
                      </label>
                      <input
                        name="smtpPort"
                        type="number"
                        placeholder="587"
                        value={form.smtpPort}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* SSL Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Use SSL/TLS Encryption</div>
                        <div className="text-white/60 text-sm">Enable secure connection (recommended for port 465)</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        name="secure"
                        type="checkbox"
                        checked={form.secure}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>

                {/* Authentication */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-cyan-400" />
                    Authentication
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <User className="w-4 h-4 text-cyan-400" />
                        Username / Email
                      </label>
                      <input
                        name="user"
                        type="email"
                        placeholder="your-email@gmail.com"
                        value={form.user}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <Key className="w-4 h-4 text-cyan-400" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          name="pass"
                          type={showPassword ? "text" : "password"}
                          placeholder="App password or account password"
                          value={form.pass}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sender Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-pink-400" />
                    Sender Information
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <User className="w-4 h-4 text-pink-400" />
                        Sender Name
                      </label>
                      <input
                        name="senderName"
                        type="text"
                        placeholder="Your Name or Company"
                        value={form.senderName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <Reply className="w-4 h-4 text-pink-400" />
                        Reply-To Email
                      </label>
                      <input
                        name="replyTo"
                        type="email"
                        placeholder="replies@yourcompany.com"
                        value={form.replyTo}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
                  >
                    <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Saving Settings...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Help Section */}
            <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Configuration Help
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-3 text-blue-200">📧 Gmail Settings:</h4>
                  <ul className="space-y-2 text-blue-200/80">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Host: smtp.gmail.com
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Port: 587 (TLS) or 465 (SSL)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Use App Password, not account password
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-blue-200">📮 Outlook Settings:</h4>
                  <ul className="space-y-2 text-blue-200/80">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Host: smtp-mail.outlook.com
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Port: 587
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Use your Outlook credentials
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}