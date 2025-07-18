'use client';

import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUsers, FaTrash, FaEye } from 'react-icons/fa';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  emailCount: number;
  lastEmailSent?: string;
}

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    htmlContent: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribe');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      } else {
        setMessage('Gabim gjatë marrjes së abonuesve');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Gabim i lidhjes me serverin');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.subject || !emailForm.message) {
      setMessage('Subjekti dhe mesazhi janë të detyrueshëm');
      setMessageType('error');
      return;
    }

    setSendingEmail(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribers/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Email u dërgua me sukses! ${data.stats.successful}/${data.stats.total} abonues`);
        setMessageType('success');
        setShowEmailForm(false);
        setEmailForm({ subject: '', message: '', htmlContent: '' });
        fetchSubscribers(); // Refresh to update stats
      } else {
        setMessage(data.error || 'Gabim gjatë dërgimit të email-it');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Gabim i lidhjes me serverin');
      setMessageType('error');
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menaxhimi i Abonuesve</h1>
          <p className="text-gray-600">Shikoni dhe menaxhoni abonuesit e newsletter-it</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Abonues</p>
                <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaEnvelope className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Email-e të Dërguara</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscribers.reduce((total, sub) => total + sub.emailCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaEye className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktivë Sot</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscribers.filter(sub => {
                    const today = new Date();
                    const subDate = new Date(sub.subscribedAt);
                    return subDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaEnvelope className="w-4 h-4" />
            Dërgo Email
          </button>
          
          <button
            onClick={fetchSubscribers}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaEye className="w-4 h-4" />
            Rifresko
          </button>
        </div>

        {/* Email Form */}
        {showEmailForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Dërgo Email në të Gjithë Abonuesit</h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjekti *
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subjekti i email-it"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesazhi *
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mesazhi që do të dërgohet"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content (Opsional)
                </label>
                <textarea
                  value={emailForm.htmlContent}
                  onChange={(e) => setEmailForm({ ...emailForm, htmlContent: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="HTML content për email-in (opsional)"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaEnvelope className="w-4 h-4" />
                  {sendingEmail ? 'Duke dërguar...' : 'Dërgo Email'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmailForm({ subject: '', message: '', htmlContent: '' });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subscribers List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista e Abonuesve</h3>
          </div>
          
          {subscribers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FaUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nuk ka abonues të regjistruar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data e Abonimit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email-e të Dërguara
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email i Fundit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscriber.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(subscriber.subscribedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscriber.emailCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscriber.lastEmailSent 
                            ? formatDate(subscriber.lastEmailSent)
                            : 'Asnjë'
                          }
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
    </div>
  );
};

export default SubscribersPage; 