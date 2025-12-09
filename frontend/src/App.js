
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CertificateCard({ cert }) {
  if (!cert) return null;
  const start = cert.startDate ? new Date(cert.startDate).toLocaleDateString() : '';
  const end = cert.endDate ? new Date(cert.endDate).toLocaleDateString() : '';
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-6">
      <h2 className="text-2xl font-bold text-center">Internship Certificate</h2>
      <div className="mt-6 space-y-2">
        <p><strong>Certificate ID:</strong> {cert.certificateId}</p>
        <p><strong>Student Name:</strong> {cert.studentName}</p>
        <p><strong>Domain:</strong> {cert.internshipDomain}</p>
        <p><strong>Start Date:</strong> {start}</p>
        <p><strong>End Date:</strong> {end}</p>
        <p><strong>Additional Info:</strong> {cert.additionalInfo}</p>
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white rounded-md">
          Download / Print (client)
        </button>
        <a
          href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/certs/download/${encodeURIComponent(cert.certificateId)}`}
          className="px-6 py-2 bg-green-600 text-white rounded-md"
          target="_blank"
          rel="noreferrer"
        >
          Download PDF (server)
        </a>
      </div>
    </div>
  );
}

function AdminArea() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [certs, setCerts] = useState([]);

  const login = async () => {
    setStatus('Logging in...');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('admin_token', res.data.token);
      setToken(res.data.token);
      setStatus('Logged in');
      fetchList(res.data.token);
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setCerts([]);
    setStatus('Logged out');
  };

  const fetchList = async (tok) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/certs`, {
        headers: { Authorization: `Bearer ${tok || token}` },
      });
      setCerts(res.data);
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Failed to fetch list');
    }
  };

  const upload = async () => {
    if (!file) {
      setStatus('Please choose a file');
      return;
    }
    if (!token) {
      setStatus('Please login as admin');
      return;
    }
    setStatus('Uploading...');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/certs/upload-excel`,
        fd,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus(`Imported ${res.data.count} rows`);
      fetchList();
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Upload failed');
    }
  };

  useEffect(() => {
    if (token) fetchList();
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded p-6 mt-6">
      {!token ? (
        <>
          <h3 className="text-xl font-semibold">Admin Login</h3>
          <div className="mt-3 flex flex-col gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border rounded px-3 py-2"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="border rounded px-3 py-2"
            />
            <button onClick={login} className="px-4 py-2 bg-indigo-600 text-white rounded">
              Login
            </button>
            <p className="text-sm text-gray-500">
              Default seeded admin: <strong>admin@certs.local</strong> / <strong>Admin@123</strong>
            </p>
            {status && <p className="text-sm mt-2">{status}</p>}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Admin Dashboard</h3>
            <div>
              <button onClick={logout} className="px-3 py-1 bg-gray-200 rounded">
                Logout
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            Upload Excel to import certificates (first sheet is used).
          </p>
          <div className="mt-4 flex gap-4">
            <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={upload} className="px-4 py-2 bg-indigo-600 text-white rounded">
              Upload
            </button>
          </div>
          {status && <p className="mt-3 text-sm">{status}</p>}

          <div className="mt-6">
            <h4 className="font-semibold">Certificates (latest 1000)</h4>
            <div className="mt-3 space-y-2 max-h-80 overflow-auto">
              {certs.length === 0 && <p className="text-sm text-gray-500">No certificates yet.</p>}
              {certs.map((c) => (
                <div key={c._id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="text-sm">
                      <strong>{c.studentName}</strong>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {c.certificateId} • {c.internshipDomain}
                    </div>
                  </div>
                  <a
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/certs/download/${encodeURIComponent(
                      c.certificateId
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [id, setId] = useState('');
  const [cert, setCert] = useState(null);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('search');

  const search = async () => {
    setMessage('');
    setCert(null);
    if (!id.trim()) {
      setMessage('Please enter Certificate ID');
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/certs/search/${encodeURIComponent(id)}`
      );
      setCert(res.data);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Not found or server error');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-indigo-50 to-white">
      <header className="max-w-4xl mx-auto text-center py-8">
        <img src="/logo192.png" alt="logo" className="mx-auto w-20 h-20" />
        <h1 className="text-4xl font-extrabold">Certificate Verification System</h1>
        <p className="mt-2 text-gray-600">
          Enter your certificate ID to view and download your internship certificate.
        </p>
      </header>

      <nav className="max-w-3xl mx-auto flex gap-2">
        <button
          onClick={() => setTab('search')}
          className={`flex-1 py-2 rounded ${tab === 'search' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
        >
          Search
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`flex-1 py-2 rounded ${tab === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
        >
          Admin
        </button>
      </nav>

      <main className="max-w-3xl mx-auto">
        {tab === 'search' && (
          <>
            <div className="bg-white shadow rounded-lg p-6 flex gap-4 items-center mt-6">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter Certificate ID"
                className="flex-1 border rounded px-4 py-2"
              />
              <button onClick={search} className="px-4 py-2 bg-indigo-600 text-white rounded">
                Search
              </button>
            </div>
            {message && <p className="text-red-600 mt-4">{message}</p>}
            <CertificateCard cert={cert} />
          </>
        )}
        {tab === 'admin' && <AdminArea />}
      </main>

      <footer className="max-w-4xl mx-auto text-center mt-12 text-sm text-gray-500">
        Built with ❤️(S) 
      </footer>
    </div>
  );
}
