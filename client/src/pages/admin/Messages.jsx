import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const endRef = useRef(null);

  const load = () => {
    Promise.all([axios.get('/messages'), axios.get('/users/clients')])
      .then(([m, c]) => { setMessages(m.data); setClients(c.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); const interval = setInterval(load, 5000); return () => clearInterval(interval); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selected]);

  const getConversation = (clientId) => {
    return messages.filter(m =>
      (m.sender?._id === clientId || m.receiver?._id === clientId) &&
      (m.sender?._id === user._id || m.receiver?._id === user._id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    try {
      await axios.post('/messages', { receiver: selected._id, content: newMsg });
      setNewMsg('');
      load();
    } catch { toast.error('Failed to send message'); }
  };

  const filteredClients = clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
      </div>
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        {/* Client list */}
        <div className="card" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div className="input-group">
              <Search className="input-icon" size={15}/>
              <input className="form-input" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: '13px' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredClients.map(client => {
              const conv = getConversation(client._id);
              const last = conv[conv.length - 1];
              const unread = conv.filter(m => !m.isRead && m.sender?._id === client._id).length;
              return (
                <div key={client._id} onClick={() => setSelected(client)} style={{
                  padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                  background: selected?._id === client._id ? '#eff6ff' : 'white',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                      {client.name?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</span>
                        {unread > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{unread}</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {last?.content || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredClients.length && <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No clients</div>}
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{selected.name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{selected.company || selected.email}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getConversation(selected._id).map(msg => {
                  const isMe = msg.sender?._id === user._id;
                  return (
                    <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? '#2563eb' : '#f1f5f9',
                          color: isMe ? 'white' : '#1e293b',
                          fontSize: '14px', lineHeight: '1.5',
                        }}>{msg.content}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                          {format(new Date(msg.createdAt), 'HH:mm · MMM d')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!getConversation(selected._id).length && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>No messages yet. Start the conversation!</div>
                )}
                <div ref={endRef} />
              </div>
              <form onSubmit={sendMessage} style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                <input className="form-input" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}><Send size={16}/></button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8', gap: '12px' }}>
              <MessageSquare size={40} />
              <p>Select a client to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
