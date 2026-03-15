import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function ClientMessages() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const endRef = useRef(null);

  const load = async () => {
    try {
      const [msgRes, usersRes] = await Promise.all([axios.get('/messages'), axios.get('/users')]);
      setMessages(msgRes.data);
      const admin = usersRes.data.find(u => u.role === 'admin');
      setAdminUser(admin);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const interval = setInterval(load, 5000); return () => clearInterval(interval); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const conversation = messages
    .filter(m => (m.sender?._id === user._id || m.receiver?._id === user._id))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !adminUser) return;
    try {
      await axios.post('/messages', { receiver: adminUser._id, content: newMsg });
      setNewMsg('');
      load();
    } catch { toast.error('Failed to send message'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
      </div>

      <div className="card" style={{ height: 'calc(100vh - 220px)', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontWeight: 600 }}>SAI TEXTILE Support</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Admin Team</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div className="loading-container"><div className="loading-spinner"/></div>
          ) : conversation.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8', gap: '12px' }}>
              <MessageSquare size={36}/>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            conversation.map(msg => {
              const isMe = msg.sender?._id === user._id;
              return (
                <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{
                      padding: '10px 15px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? '#2563eb' : '#f1f5f9',
                      color: isMe ? 'white' : '#1e293b',
                      fontSize: '14px', lineHeight: 1.5,
                    }}>{msg.content}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                      {format(new Date(msg.createdAt), 'HH:mm · MMM d')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
          <input className="form-input" placeholder="Type your message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }} disabled={!adminUser}><Send size={16}/></button>
        </form>
      </div>
    </div>
  );
}
