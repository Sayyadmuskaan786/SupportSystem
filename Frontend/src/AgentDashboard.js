import React, { useState, useEffect } from 'react';
import AgentSidebar from './AgentSidebar';

function AgentDashboard({ token, userId }) {
  const [agentId, setAgentId] = useState(userId);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketForComments, setSelectedTicketForComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [activeView, setActiveView] = useState('view');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (!token || !agentId) return;

    let intervalId;

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:8080/api/tickets/assigned`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();

        // For each ticket, fetch comments with userRole included
        const ticketsWithComments = await Promise.all(data.map(async (ticket) => {
          const commentsRes = await fetch(`http://localhost:8080/api/comments/ticket/${ticket.id}/ordered`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const comments = commentsRes.ok ? await commentsRes.json() : [];
          return { ...ticket, comments };
        }));
        setTickets(ticketsWithComments);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    intervalId = setInterval(fetchTickets, 10000);

    return () => clearInterval(intervalId);
  }, [token, agentId]);

  useEffect(() => {
    if (activeView === 'viewProfile' && token && agentId) {
      setLoading(true);
      setError(null);
      fetch(`http://localhost:8080/api/users/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })
        .then(data => {
          setProfile(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error fetching profile:', err);
          setError('Failed to fetch profile');
        })
        .finally(() => setLoading(false));
    }
  }, [activeView, token, agentId]);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    fetch(`http://localhost:8080/api/users/${agentId}/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(text || 'Failed to change password'); });
        }
        return res.json();
      })
      .then(() => {
        setPasswordSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch(err => {
        setPasswordError(err.message);
      })
      .finally(() => {
        setPasswordLoading(false);
      });
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedTicketId) {
      // Post new comment to backend with ticketId in URL path
      fetch(`http://localhost:8080/api/comments/ticket/${selectedTicketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => { throw new Error(text || 'Failed to add comment'); });
          }
          return res.json();
        })
        .then(newCommentData => {
          if (!newCommentData.userRole && newCommentData.user) {
            newCommentData.userRole = newCommentData.user.role || 'AGENT';
          }
          setTickets(prev => {
            const newTickets = JSON.parse(JSON.stringify(prev));
            const ticketIndex = newTickets.findIndex(t => t.id === selectedTicketId);
            if (ticketIndex !== -1) {
              newTickets[ticketIndex].comments = [...(newTickets[ticketIndex].comments || []), newCommentData];
            }
            return newTickets;
          });
          setNewComment('');
          setError(null);
        })
        .catch(err => {
          console.error('Error adding comment:', err);
          setError('Failed to add comment: ' + err.message);
        });
    }
  };

  const handleEditComment = (ticketId, commentId, text) => {
    setSelectedTicketId(ticketId);
    setEditCommentId(commentId);
    setEditCommentText(text);
  };

  const handleUpdateComment = () => {
    if (editCommentText.trim() && selectedTicketId && editCommentId !== null) {
      fetch(`http://localhost:8080/api/comments/${editCommentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editCommentText }),
      })
        .then(res => {
          if (res.ok) {
            setTickets(tickets.map(ticket => {
              if (ticket.id === selectedTicketId) {
                return {
                  ...ticket,
                  comments: ticket.comments.map(comment =>
                    comment.id === editCommentId ? { ...comment, content: editCommentText } : comment
                  ),
                };
              }
              return ticket;
            }));
            setEditCommentId(null);
            setEditCommentText('');
          } else {
            console.error('Failed to update comment');
          }
        })
        .catch(err => console.error('Error updating comment:', err));
    }
  };

  const handleChangeTicketState = (ticketId, newState) => {
    fetch(`http://localhost:8080/api/tickets/${ticketId}/state?state=${newState}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.ok) {
          setTickets(tickets.map(ticket =>
            ticket.id === ticketId ? { ...ticket, state: newState } : ticket
          ));
        } else {
          console.error('Failed to update ticket state');
        }
      })
      .catch(err => console.error('Error updating ticket state:', err));
  };

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100">
      <AgentSidebar onSelect={setActiveView} activeView={activeView} />
      <main className="flex-grow p-8 ml-64 max-w-6xl mx-auto flex justify-center items-center min-h-screen">

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {activeView === 'view' && (
          <>
            <section className="mb-8 w-full max-w-4xl">
              <h2 className="text-2xl font-semibold mb-4 text-blue-800 text-center">Tickets (Total: {tickets.length})</h2>
              <div className="flex flex-col items-center space-y-6">
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`w-full max-w-md p-6 rounded-xl shadow-2xl transition-shadow duration-500 border ${
                      ticket.state === 'CLOSED'
                        ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-50 to-white border-blue-200 hover:shadow-blue-400'
                    }`}
                  >
                    <p className="text-sm text-blue-600 mb-2 font-semibold"><strong>Created By:</strong> {ticket.createdBy && ticket.createdBy.username ? ticket.createdBy.username : 'Unknown'}</p>
                    <p className="text-sm text-blue-600 mb-2 font-semibold"><strong>Created At:</strong> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}</p>
                    {/* {ticket.state !== 'CLOSED' && (
                      <p className="text-sm text-blue-600 mb-2 font-semibold"><strong>Closed At:</strong> N/A</p>
                    )} */}
                    {ticket.state === 'CLOSED' && (
                      <p className="text-sm text-blue-600 mb-2 font-semibold"><strong>Closed At:</strong> {ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : 'N/A'}</p>
                    )}
                    <h3 className="text-2xl font-bold mb-4 text-blue-900">{ticket.title}</h3>
                    <p className="mb-6 text-gray-800">{ticket.description}</p>
                    {/* Comments Section */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-blue-700">Comments:</h4>
                      {ticket.comments && ticket.comments.length > 0 ? (
                        <ul className="list-disc list-inside max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
                          {ticket.comments.map(comment => (
                            <li key={comment.id} className="mb-1 flex justify-between items-center">
                              <div
                                className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                                  comment.userRole === 'AGENT'
                                    ? 'bg-blue-100 text-blue-900 rounded-br-none border border-blue-300 self-end'
                                    : 'bg-green-200 text-green-900 rounded-bl-none border border-green-400 self-start'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{comment.content}</p>
                                <small className="block mt-1 text-xs text-gray-600">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </small>
                                <div className="mt-1 text-xs font-semibold">
                                  {comment.userRole === 'AGENT' ? 'Agent' : 'Customer'}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No comments yet.</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-2 text-blue-800">Status:</label>
                      <select
                        value={ticket.state}
                        onChange={(e) => handleChangeTicketState(ticket.id, e.target.value)}
                        className="border border-blue-400 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        {(ticket.state === 'ASSIGNED' || ticket.state === 'OPEN') ? (
                          <>
                            <option value="OPEN">OPEN</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="CLOSED">CLOSED</option>
                          </>
                        ) : (
                          <>
                            <option value="OPEN" disabled>OPEN</option>
                            <option value="ASSIGNED" disabled>ASSIGNED</option>
                            <option value="CLOSED" disabled>CLOSED</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add a comment"
                        value={selectedTicketId === ticket.id ? newComment : ''}
                        onChange={(e) => {
                          setSelectedTicketId(ticket.id);
                          setNewComment(e.target.value);
                        }}
                        className="border px-2 py-1 rounded flex-grow"
                        disabled={ticket.state === 'CLOSED'}
                      />
                      <button
                        onClick={handleAddComment}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                        disabled={selectedTicketId !== ticket.id || ticket.state === 'CLOSED'}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === 'viewProfile' && (
          <section className="mb-8 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold mb-6 text-blue-800">Profile</h2>
            {loading && <p>Loading profile...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {profile && (
              <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-lg mx-auto overflow-hidden">
                    <img
                      src="download.jpeg"
                      alt="Profile Icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium"><strong>ID:</strong> {profile.id}</p>
                  <p className="text-lg font-medium"><strong>Username:</strong> {profile.username}</p>
                  <p className="text-lg font-medium"><strong>Email:</strong> {profile.email}</p>
                  <p className="text-lg font-medium"><strong>Role:</strong> Engineer</p>
                </div>
              </div>
            )}
          </section>
        )}

       
      </main>
    </div>
  );
}

export default AgentDashboard;
