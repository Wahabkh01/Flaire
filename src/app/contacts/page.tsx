"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from "@/config";

interface Contact {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  company?: string;
  [key: string]: any;
}


interface ParseResult {
  data: Contact[];
  errors: string[];
  totalRows: number;
  validRows: number;
  headers: string[];
}

export default function ContactsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewLimit] = useState(10);
  const [listName, setListName] = useState("");


  const normalizeHeaders = (headers: string[]): string[] => {
    return headers.map(header => {
      const normalized = header.toLowerCase().trim();
      
      // Map common variations to standard field names
      const headerMappings: { [key: string]: string } = {
        'email address': 'email',
        'email_address': 'email',
        'e-mail': 'email',
        'mail': 'email',
        'first name': 'firstName',
        'first_name': 'firstName',
        'firstname': 'firstName',
        'fname': 'firstName',
        'last name': 'lastName',
        'last_name': 'lastName',
        'lastname': 'lastName',
        'lname': 'lastName',
        'surname': 'lastName',
        'full name': 'name',
        'full_name': 'name',
        'fullname': 'name',
        'phone number': 'phone',
        'phone_number': 'phone',
        'mobile': 'phone',
        'cell': 'phone',
        'telephone': 'phone',
        'company name': 'company',
        'company_name': 'company',
        'organization': 'company',
        'org': 'company'
      };

      return headerMappings[normalized] || normalized;
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const parseCSV = (file: File): Promise<ParseResult> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimitersToGuess: [',', '\t', '|', ';'],
        complete: (results) => {
          const errors: string[] = [];
          const validContacts: Contact[] = [];
          
          // Get original headers and normalize them
          const originalHeaders = results.meta.fields || [];
          const normalizedHeaders = normalizeHeaders(originalHeaders);
          
          results.data.forEach((row: any, index: number) => {
            try {
              const contact: Contact = {};
              let hasEmail = false;
              
              // Map row data using normalized headers
              originalHeaders.forEach((originalHeader, headerIndex) => {
                const normalizedHeader = normalizedHeaders[headerIndex];
                const value = row[originalHeader];
                
                if (value !== null && value !== undefined && value !== '') {
                  contact[normalizedHeader] = String(value).trim();
                }
              });

              // Find email field (try different possible field names)
              const emailFields = ['email', 'email_address', 'emailaddress'];
              for (const field of emailFields) {
                if (contact[field] && validateEmail(contact[field])) {
                  contact.email = contact[field];
                  hasEmail = true;
                  break;
                }
              }

              // If no standard email field found, look through all fields
              if (!hasEmail) {
                for (const [key, value] of Object.entries(contact)) {
                  if (typeof value === 'string' && validateEmail(value)) {
                    contact.email = value;
                    hasEmail = true;
                    break;
                  }
                }
              }

              if (!hasEmail) {
                errors.push(`Row ${index + 2}: No valid email found`);
                return;
              }

              // Construct full name if firstName and lastName exist but name doesn't
              if (!contact.name && (contact.firstName || contact.lastName)) {
                contact.name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
              }

              // Split name into firstName and lastName if only name exists
              if (contact.name && !contact.firstName && !contact.lastName) {
                const nameParts = contact.name.split(' ');
                contact.firstName = nameParts[0];
                if (nameParts.length > 1) {
                  contact.lastName = nameParts.slice(1).join(' ');
                }
              }

              validContacts.push(contact);
            } catch (error) {
              errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Parse error'}`);
            }
          });

          resolve({
            data: validContacts,
            errors: errors,
            totalRows: results.data.length,
            validRows: validContacts.length,
            headers: normalizedHeaders.filter((header, index, arr) => arr.indexOf(header) === index)
          });
        },
        error: (error) => {
          resolve({
            data: [],
            errors: [`CSV Parse Error: ${error.message}`],
            totalRows: 0,
            validRows: 0,
            headers: []
          });
        }
      });
    });
  };

  const parseExcel = (file: File): Promise<ParseResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            resolve({
              data: [],
              errors: ['Excel file is empty'],
              totalRows: 0,
              validRows: 0,
              headers: []
            });
            return;
          }

          const headers = jsonData[0] as string[];
          const normalizedHeaders = normalizeHeaders(headers);
          const errors: string[] = [];
          const validContacts: Contact[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.every(cell => !cell)) continue; // Skip empty rows

            try {
              const contact: Contact = {};
              let hasEmail = false;

              // Map row data using headers
              headers.forEach((header, index) => {
                const value = row[index];
                if (value !== null && value !== undefined && value !== '') {
                  const normalizedHeader = normalizedHeaders[index];
                  contact[normalizedHeader] = String(value).trim();
                }
              });

              // Find email (same logic as CSV)
              const emailFields = ['email', 'email_address', 'emailaddress'];
              for (const field of emailFields) {
                if (contact[field] && validateEmail(contact[field])) {
                  contact.email = contact[field];
                  hasEmail = true;
                  break;
                }
              }

              if (!hasEmail) {
                for (const [key, value] of Object.entries(contact)) {
                  if (typeof value === 'string' && validateEmail(value)) {
                    contact.email = value;
                    hasEmail = true;
                    break;
                  }
                }
              }

              if (!hasEmail) {
                errors.push(`Row ${i + 1}: No valid email found`);
                continue;
              }

              // Handle name fields (same logic as CSV)
              if (!contact.name && (contact.firstName || contact.lastName)) {
                contact.name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
              }

              if (contact.name && !contact.firstName && !contact.lastName) {
                const nameParts = contact.name.split(' ');
                contact.firstName = nameParts[0];
                if (nameParts.length > 1) {
                  contact.lastName = nameParts.slice(1).join(' ');
                }
              }

              validContacts.push(contact);
            } catch (error) {
              errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
            }
          }

          resolve({
            data: validContacts,
            errors: errors,
            totalRows: jsonData.length - 1,
            validRows: validContacts.length,
            headers: normalizedHeaders.filter((header, index, arr) => arr.indexOf(header) === index)
          });

        } catch (error) {
          resolve({
            data: [],
            errors: [`Excel Parse Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            totalRows: 0,
            validRows: 0,
            headers: []
          });
        }
      };

      reader.onerror = () => {
        resolve({
          data: [],
          errors: ['Failed to read Excel file'],
          totalRows: 0,
          validRows: 0,
          headers: []
        });
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handlePreview = async (selectedFile: File) => {
    setFile(selectedFile);
    setParsing(true);
    setParseResult(null);

    try {
      let result: ParseResult;
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        result = await parseCSV(selectedFile);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        result = await parseExcel(selectedFile);
      } else {
        result = {
          data: [],
          errors: ['Unsupported file format. Please upload CSV, XLS, or XLSX files.'],
          totalRows: 0,
          validRows: 0,
          headers: []
        };
      }

      setParseResult(result);
    } catch (error) {
      setParseResult({
        data: [],
        errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        totalRows: 0,
        validRows: 0,
        headers: []
      });
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !parseResult || parseResult.validRows === 0) return;
  
    if (!listName.trim()) {
      alert("Please enter a name for your list.");
      return;
    }
  
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("listName", listName.trim());  // ✅ include list name
  
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      const data = await res.json();
      alert(`${data.inserted || parseResult.validRows} contacts uploaded to "${listName}" successfully!`);
      setFile(null);
      setParseResult(null);
      setListName("");  // reset field
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handlePreview(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      handlePreview(e.dataTransfer.files[0]);
    }
  };

  const resetFile = () => {
    setFile(null);
    setParseResult(null);
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

        <main className="flex-1 relative z-10 p-6 max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
            Manage Contacts
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
  <label className="block text-white mb-2">List Name</label>
  <input
    type="text"
    value={listName}
    onChange={(e) => setListName(e.target.value)}
    placeholder="e.g. Friends, Customers"
    className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    disabled={uploading || parsing}
  />

            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-3xl mr-3">📁</span>
                  Upload Contacts
                </h2>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                  }`}
                >
                  <div className="mb-6">
                    <div className="text-6xl mb-4">☁️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {dragActive ? 'Drop your file here' : 'Drag & drop your file'}
                    </h3>
                    <p className="text-white/60">Supports CSV, XLS, XLSX files</p>
                  </div>
                  
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading || parsing}
                  />
                </div>

                {file && (
                  <div className="mt-6">
                    <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📄</span>
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-white/60 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={resetFile}
                          className="text-white/60 hover:text-white transition-colors"
                          disabled={uploading || parsing}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Parse Results Summary */}
                    {parseResult && (
                      <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">Parse Results</h4>
                          <span className="text-sm text-white/60">
                            {parseResult.validRows} / {parseResult.totalRows} valid
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-400">✓ Valid contacts:</span>
                            <span className="text-white">{parseResult.validRows}</span>
                          </div>
                          {parseResult.errors.length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-red-400">⚠ Errors:</span>
                              <span className="text-white">{parseResult.errors.length}</span>
                            </div>
                          )}
                        </div>
                        
                        {parseResult.headers.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-white/60 mb-2">Detected fields:</p>
                            <div className="flex flex-wrap gap-1">
                              {parseResult.headers.slice(0, 6).map((header, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
                                >
                                  {header}
                                </span>
                              ))}
                              {parseResult.headers.length > 6 && (
                                <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded">
                                  +{parseResult.headers.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || !parseResult || parseResult.validRows === 0 || uploading || parsing}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : parsing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Parsing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⬆️</span>
                      Upload {parseResult?.validRows || 0} Contacts
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-3xl mr-3">👀</span>
                    Preview
                  </span>
                  {parseResult && parseResult.data.length > previewLimit && (
                    <span className="text-sm text-white/60">
                      Showing {previewLimit} of {parseResult.data.length}
                    </span>
                  )}
                </h2>

                {parsing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white/60">Parsing file...</p>
                  </div>
                ) : parseResult && parseResult.data.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-white/60 mb-4">
                      Found {parseResult.validRows} valid contact{parseResult.validRows !== 1 ? 's' : ''} 
                      {parseResult.errors.length > 0 && (
                        <span className="text-red-400 ml-2">
                          ({parseResult.errors.length} error{parseResult.errors.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {parseResult.data.slice(0, previewLimit).map((contact, idx) => (
                        <div
                          key={idx}
                          className="bg-white/10 rounded-lg p-4 border border-white/20 animate-fade-in"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {contact.firstName?.[0] || contact.name?.[0] || contact.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'No name'}
                              </p>
                              <p className="text-white/60 text-sm">{contact.email}</p>
                              {contact.company && (
                                <p className="text-white/50 text-xs">{contact.company}</p>
                              )}
                            </div>
                            {contact.phone && (
                              <div className="text-right">
                                <p className="text-white/60 text-sm">{contact.phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show errors if any */}
                    {parseResult.errors.length > 0 && (
                      <div className="mt-4">
                        <details className="text-sm">
                          <summary className="text-red-400 cursor-pointer hover:text-red-300">
                            View {parseResult.errors.length} error{parseResult.errors.length !== 1 ? 's' : ''}
                          </summary>
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {parseResult.errors.slice(0, 5).map((error, idx) => (
                              <p key={idx} className="text-red-300/80 text-xs pl-4">
                                • {error}
                              </p>
                            ))}
                            {parseResult.errors.length > 5 && (
                              <p className="text-red-300/60 text-xs pl-4">
                                ... and {parseResult.errors.length - 5} more errors
                              </p>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-30">📋</div>
                    <p className="text-white/60">
                      Select a CSV or Excel file to see a preview of your contacts
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}