import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

function CustomerDashboard({ token, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketRoomNo, setNewTicketRoomNo] = useState('');
  const [newTicketPlace, setNewTicketPlace] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketForComments, setSelectedTicketForComments] = useState(null);

  const [showTicketCreatedDialog, setShowTicketCreatedDialog] = useState(false);
  const [createdTicketDetails, setCreatedTicketDetails] = useState(null);

  // Sync selectedTicketId with selectedTicketForComments for comments section
  useEffect(() => {
    if (selectedTicketForComments) {
      setSelectedTicketId(Number(selectedTicketForComments));
    } else {
      setSelectedTicketId(null);
    }
  }, [selectedTicketForComments]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [activeView, setActiveView] = useState('create');

  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [myTicketComments, setMyTicketComments] = useState([]);
  const [showTicketCommentsFor, setShowTicketCommentsFor] = useState(null);

  // New state for sidebar open/close
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle sidebar open/close
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!userId || !token) return;
    setProfileLoading(true);
    fetch(`http://localhost:8080/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user profile');
        return res.json();
      })
      .then(profile => {
        setUserProfile(profile);
        setProfileError(null);
      })
      .catch(err => setProfileError(err.message))
      .finally(() => setProfileLoading(false));
  }, [userId, token]);

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!token) return;

    let intervalId;

    const fetchTickets = async () => {
      if (initialLoad) setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/customer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const ticketsData = await res.json();
        const ticketsWithComments = await Promise.all(ticketsData.map(async (ticket) => {
          const commentsRes = await fetch(`http://localhost:8080/api/comments/ticket/${ticket.id}/ordered`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const comments = commentsRes.ok ? await commentsRes.json() : [];
          return { ...ticket, comments };
        }));
        setTickets(ticketsWithComments);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        if (initialLoad) setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchTickets();

    intervalId = setInterval(fetchTickets, 10000);

    return () => clearInterval(intervalId);
  }, [token, initialLoad]);

  const handleCreateTicket = () => {
    if (newTicketTitle.trim() && newTicketRoomNo.trim() && newTicketPlace.trim()) {
      fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTicketTitle,
          description: newTicketDescription,
          roomNo: newTicketRoomNo,
          place: newTicketPlace,
          state: 'OPEN',
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to create ticket');
          return res.json();
        })
        .then(newTicket => {
          setTickets(prev => [...prev, newTicket]);
          setNewTicketTitle('');
          setNewTicketDescription('');
          setNewTicketRoomNo('');
          setNewTicketPlace('');
          setCreatedTicketDetails(newTicket);
          setShowTicketCreatedDialog(true);
          setError(null);
        })
        .catch(err => setError(err.message));
    } else {
      setError('Please fill in Title, Room No., and Place fields.');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedTicketId) {
      fetch(`http://localhost:8080/api/comments/ticket/${selectedTicketId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add comment');
          return res.json();
        })
        .then(newCommentData => {
          if (!newCommentData.userRole && newCommentData.user) {
            newCommentData.userRole = newCommentData.user.role || 'CUSTOMER';
          }
          setTickets(prev =>
            prev.map(ticket =>
              ticket.id === selectedTicketId
                ? {
                    ...ticket,
                    comments: [...(ticket.comments || []), newCommentData],
                  }
                : ticket
            )
          );
          setSelectedTicketForComments(Number(selectedTicketId));
          setSelectedTicketId(Number(selectedTicketId));
          setNewComment('');
          setError(null);
        })
        .catch(err => setError(err.message));
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editCommentText }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update comment');
          return res.json();
        })
        .then(() => {
          setTickets(prev =>
            prev.map(ticket =>
              ticket.id === selectedTicketId
                ? {
                    ...ticket,
                    comments: ticket.comments.map(comment =>
                      comment.id === editCommentId
                        ? { ...comment, content: editCommentText, userRole: comment.userRole || 'CUSTOMER' }
                        : comment
                    ),
                  }
                : ticket
            )
          );
          setEditCommentId(null);
          setEditCommentText('');
          setError(null);
        })
        .catch(err => setError(err.message));
    }
  };

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <main className="flex-grow p-8 ml-64">
        {loading && <p>Loading...</p>}
        {activeView === 'profile' && error && <p className="text-red-600 mb-4">{error}</p>}

        {activeView === 'create' && (
          <div className="mb-6 max-w-3xl">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Create Ticket</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded mb-3 w-full"
              required
            />
            <input
              type="text"
              placeholder="Room No."
              value={newTicketRoomNo}
              onChange={(e) => setNewTicketRoomNo(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded mb-3 w-full"
              required
            />
            <input
              type="text"
              placeholder="Place"
              value={newTicketPlace}
              onChange={(e) => setNewTicketPlace(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded mb-3 w-full"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newTicketDescription}
              onChange={(e) => setNewTicketDescription(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded mb-3 w-full"
              rows="4"
            />
            <button
              onClick={handleCreateTicket}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Create Ticket
            </button>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        )}

        {activeView === 'view' && (
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">View Tickets</h2>
                {tickets.length === 0 ? (
                  <p>No tickets found.</p>
                ) : (
                  tickets.map(ticket => {
                    return (
                      <div key={ticket.id} className="border p-4 rounded shadow bg-white">
                        <h3 className="text-xl font-semibold">{ticket.title}</h3>
                        <p className="mb-1">Status: <strong>{ticket.state}</strong></p>
                        <p className="text-gray-700 mb-3">{ticket.description}</p>
                        {(ticket.createdBy && ticket.createdBy.id == userId && ticket.state === 'OPEN') && (
                          <button
                            onClick={() => {
                              console.log('Deleting ticket:', ticket.id, 'UserId:', userId, 'Ticket createdBy id:', ticket.createdBy.id);
                              fetch(`http://localhost:8080/api/tickets/${ticket.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                },
                              })
                                .then(res => {
                                  if (!res.ok) {
                                    throw new Error('Failed to delete ticket');
                                  }
                                  setTickets(tickets.filter(t => t.id !== ticket.id));
                                  alert('Ticket deleted successfully');
                                })
                                .catch(err => {
                                  console.error('Error deleting ticket:', err);
                                  alert('Error deleting ticket: ' + err.message);
                                });
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
          </div>
        )}

        {activeView === 'comments' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Comments</h2>
            <div>
              <label htmlFor="ticketSelect" className="block mb-1 font-medium">Select Ticket</label>
              <select
                id="ticketSelect"
                value={selectedTicketForComments || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTicketForComments(Number(val));
                  if (!val) {
                    setSelectedTicketId(null);
                    setNewComment('');
                  }
                }}
                className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
              >
                <option value="" disabled>Select a ticket</option>
                {tickets.map(ticket => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.title} (ID: {ticket.id})
                  </option>
                ))}
              </select>
            </div>
            {selectedTicketForComments && (
              <div className="border p-4 rounded shadow bg-white mb-6 max-h-96 overflow-y-auto px-2 mt-4">
                {(() => {
                  const comments = tickets.find(t => t.id === selectedTicketForComments)?.comments || [];
                  if (comments.length === 0) {
                    return <p className="text-gray-500 italic">No comments yet.</p>;
                  }
                  return comments.map(comment => {
                    const isAgent = comment.userRole === 'AGENT';
                    return (
                      <div
                        key={comment.id}
                        className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg shadow ${isAgent ? 'bg-blue-200 text-blue-900 rounded-bl-none border border-blue-400' : 'bg-green-500 text-white rounded-br-none border border-green-700'}`}
                        >
                          <p className="whitespace-pre-wrap">{comment.content}</p>
                          <small className="block mt-1 text-xs text-gray-600">
                            {new Date(comment.createdAt).toLocaleString()}
                          </small>
                          <div className="mt-1 text-xs font-semibold">
                            {isAgent ? 'Agent' : 'Customer'}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                {tickets.find(t => t.id === selectedTicketForComments)?.state !== 'CLOSED' && (
                  <div className="flex space-x-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add a comment"
                      value={selectedTicketId === selectedTicketForComments ? newComment : ''}
                      onChange={(e) => {
                        setSelectedTicketId(selectedTicketForComments);
                        setNewComment(e.target.value);
                      }}
                      className="border px-2 py-1 rounded flex-grow"
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white px-4 py-1 rounded"
                      disabled={selectedTicketId !== selectedTicketForComments}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeView === 'profile' && (
          <section className="mb-8 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold mb-6 text-blue-800">Profile</h2>
            {profileLoading && <p>Loading profile...</p>}
            {profileError && <p className="text-red-600">{profileError}</p>}
            {userProfile && (
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
                  <p className="text-lg font-medium"><strong>ID:</strong> {userProfile.id}</p>
                  <p className="text-lg font-medium"><strong>Username:</strong> {userProfile.username}</p>
                  <p className="text-lg font-medium"><strong>Email:</strong> {userProfile.email}</p>
                  <p className="text-lg font-medium"><strong>Role:</strong> Employee</p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;
