import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X, Check, XCircle, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useNavigate, useLocation } from 'react-router-dom';

const localizer = momentLocalizer(moment);

interface Meeting {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  meetingLink: string;
  host: { _id: string; name: string; email: string };
  attendee: { _id: string; name: string; email: string };
}

export const MeetingsPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    attendeeId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  const location = useLocation();

  useEffect(() => {
    const state = location.state as { attendeeId?: string };
    if (state?.attendeeId) {
      setForm(prev => ({
        ...prev,
        attendeeId: state.attendeeId || ''
      }));
      setShowModal(true);
    }
  }, [location.state]);

  const fetchMeetings = useCallback(async () => {
    try {
      const data = await apiGet<Meeting[]>('/meetings', token);
      setMeetings(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiGet<any[]>('/profile', token);
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => { 
    fetchMeetings(); 
    if (token) fetchUsers();
  }, [fetchMeetings, fetchUsers, token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiPost<any>('/meetings', form, token);
      setMeetings(prev => [...prev, data]);
      setShowModal(false);
      setForm({ attendeeId: '', title: '', description: '', startTime: '', endTime: '' });
    } catch (err) {
      setError((err as Error).message || 'Failed to create meeting');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await apiPut<any>(`/meetings/${id}/status`, { status }, token);
      setMeetings(prev => prev.map(m => m._id === id ? updated : m));
    } catch (e) {
      console.error(e);
    }
  };

  const calendarEvents = meetings
    .filter(m => m.status !== 'cancelled' && m.status !== 'rejected')
    .map(m => ({
      id: m._id,
      title: m.title,
      start: new Date(m.startTime),
      end: new Date(m.endTime),
      resource: m
    }));

  const pending = meetings.filter(m => m.status === 'pending' && m.attendee._id === user?.id);
  const upcoming = meetings.filter(m => m.status === 'accepted' && new Date(m.startTime) > new Date());

  const statusColor: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
    cancelled: 'gray'
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your meetings</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowModal(true)}>
          Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Pending Requests <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({pending.length})</span>
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {pending.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center py-4">No pending requests</p>
              ) : pending.map(m => (
                <div key={m._id} className="border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-3">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{m.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">From: {m.host.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">{moment(m.startTime).format('MMM D, h:mm A')}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateStatus(m._id, 'accepted')}
                      className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      <Check size={12} /> Accept
                    </button>
                    <button
                      onClick={() => updateStatus(m._id, 'rejected')}
                      className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming ({upcoming.length})</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center py-4">No upcoming meetings</p>
              ) : upcoming.map(m => (
                <div key={m._id} className="border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{m.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    {m.host._id === user?.id ? `With: ${m.attendee.name}` : `With: ${m.host.name}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">{moment(m.startTime).format('MMM D, h:mm A')}</p>
                  <button
                    onClick={() => navigate(`/call/${m._id}`)}
                    className="flex items-center gap-1 text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 mt-2"
                  >
                    <Video size={12} /> Join Call
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-2">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.MONTH}
                eventPropGetter={(event: any) => {
                  const m = event.resource as Meeting;
                  const bg = m.status === 'accepted' ? '#16a34a' : m.status === 'pending' ? '#ca8a04' : '#6b7280';
                  return { style: { backgroundColor: bg, borderRadius: '4px', border: 'none' } };
                }}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* All Meetings List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Meetings</h2>
        </CardHeader>
        <CardBody>
          {meetings.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-300 py-8">No meetings yet. Schedule your first one!</p>
          ) : (
            <div className="space-y-2">
              {meetings.map(m => (
                <div key={m._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{m.title}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      {m.host._id === user?.id ? `→ ${m.attendee.name}` : `← ${m.host.name}`}
                      {' · '}{moment(m.startTime).format('MMM D, YYYY h:mm A')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor[m.status] as any}>{m.status}</Badge>
                    {m.status === 'accepted' && (
                      <button
                        onClick={() => navigate(`/call/${m._id}`)}
                        className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 flex items-center gap-1"
                      >
                        <Video size={12} /> Join
                      </button>
                    )}
                    {m.host._id === user?.id && m.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(m._id, 'cancelled')}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Meeting</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded p-2">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attendee</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  value={form.attendeeId}
                  onChange={e => setForm(f => ({ ...f, attendeeId: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select a user to meet with</option>
                  {users.map(u => (
                    <option key={u.user?._id} value={u.user?._id}>
                      {u.user?.name} ({u.user?.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  placeholder="Investment Discussion"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="What's this meeting about?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white color-scheme-dark"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white color-scheme-dark"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" fullWidth>Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
