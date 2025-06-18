import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

function AdminDashboard({ token, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [selectedTicketAssign, setSelectedTicketAssign] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [showTickets, setShowTickets] = useState(true);
  const [activeSection, setActiveSection] = useState('viewUsers');
  const [profile, setProfile] = useState(null);
  const [userFilter, setUserFilter] = useState(null); // 'agents', 'customers', or null for no filter
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);

  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminCreationMessage, setAdminCreationMessage] = useState('');

  // Add handleCreateAdmin function
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminCreationMessage('');
    if (!newAdminUsername || !newAdminEmail || !newAdminPassword) {
      setAdminCreationMessage('Please fill in all fields.');
      return;
    }
    try {
      // Fetch CSRF token from cookie or endpoint if applicable
      const csrfToken = getCookie('XSRF-TOKEN'); // Implement getCookie function or adjust as needed

      const response = await fetch('http://localhost:8080/api/users/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-TOKEN': csrfToken,
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({
          username: newAdminUsername,
          email: newAdminEmail,
          password: newAdminPassword,
        }),
      });
      if (response.ok) {
        setAdminCreationMessage('Admin user created successfully.');
        setNewAdminUsername('');
        setNewAdminEmail('');
        setNewAdminPassword('');
      } else {
        const errorText = await response.text();
        setAdminCreationMessage(`Failed to create admin: ${errorText}`);
      }
    } catch (error) {
      setAdminCreationMessage(`Error: ${error.message}`);
    }
  };

  // Helper function to get cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Function to delete a comment by id
  const deleteComment = (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    fetch(`http://localhost:8080/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to delete comment');
        }
        // Remove deleted comment from state
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        alert('Error deleting comment: ' + err.message);
      });
  };

  const [agentCount, setAgentCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  // Fetch available agents when assignTickets section is active
  useEffect(() => {
    if (activeSection === 'assignTickets') {
      const authHeader = `Bearer ${token}`;
      fetch('http://localhost:8080/api/users/agents', {
        headers: { Authorization: authHeader },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch agents');
          return res.json();
        })
        .then(data => {
          setAvailableAgents(data);
        })
        .catch(err => {
          console.error('Error fetching agents:', err);
          setAvailableAgents([]);
        });
    }
  }, [activeSection, token]);

  // Fetch counts of agents and customers when viewing users
  useEffect(() => {
    if (activeSection === 'viewUsers' && token) {
      const authHeader = `Bearer ${token}`;
      fetch('http://localhost:8080/api/users/agents', {
        headers: { Authorization: authHeader },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch agents');
          return res.json();
        })
        .then(data => {
          setAgentCount(data.length);
        })
        .catch(err => {
          console.error('Error fetching agent count:', err);
          setAgentCount(0);
        });

      fetch('http://localhost:8080/api/users/customers', {
        headers: { Authorization: authHeader },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch customers');
          return res.json();
        })
        .then(data => {
          setCustomerCount(data.length);
        })
        .catch(err => {
          console.error('Error fetching customer count:', err);
          setCustomerCount(0);
        });
    }
  }, [activeSection, token]);

  const [ticketFilter, setTicketFilter] = useState(null); // 'open', 'closed', 'assigned', or null for no filter
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState(null);
  const [allTickets, setAllTickets] = useState([]);

  // Add assignTicket function to restore assign ticket functionality
  const assignTicket = () => {
    if (!selectedTicketAssign || !selectedAgent) return;

    const authHeader = `Bearer ${token}`;
    fetch(`http://localhost:8080/api/tickets/${selectedTicketAssign}/assign/${selectedAgent}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to assign ticket');
        return res.json();
      })
      .then(data => {
        // Update tickets state to reflect the assigned ticket
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === data.id ? data : ticket
          )
        );
        // Clear selection after assignment
        setSelectedTicketAssign(null);
        setSelectedAgent(null);
        // Optionally, refresh openTickets list
        setOpenTickets(prevOpenTickets =>
          prevOpenTickets.filter(ticket => ticket.id !== data.id)
        );
        setTicketError(null);
      })
      .catch(err => {
        console.error('Error assigning ticket:', err);
        setTicketError(err.message);
      });
  };

  useEffect(() => {
    if (!token) return;
    const authHeader = `Bearer ${token}`;

    let intervalId;

    const fetchTickets = () => {
      if (activeSection === 'viewTickets') {
        // Always fetch all tickets for the total count and for resetting filters
        fetch('http://localhost:8080/api/tickets/gettickets', {
          headers: { Authorization: authHeader },
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch tickets');
            return res.json();
          })
          .then(data => {
            setAllTickets(data);
            setOpenTickets(data.filter(ticket => ticket.state === 'OPEN'));
            // If no filter, show all tickets
            if (!ticketFilter) setTickets(data);
          })
          .catch(err => setError(err.message));
      }

      // Fetch filtered tickets for the table
      if (activeSection === 'viewTickets' && ticketFilter) {
        setLoadingTickets(true);
        let url = 'http://localhost:8080/api/tickets/assigned/all';
        if (ticketFilter === 'open') {
          url = 'http://localhost:8080/api/tickets/open';
        } else if (ticketFilter === 'closed') {
          url = 'http://localhost:8080/api/tickets/closed';
        }
        fetch(url, {
          headers: { Authorization: authHeader },
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch tickets');
            return res.json();
          })
          .then(data => {
            setTickets(data);
            setTicketError(null);
          })
          .catch(err => {
            setTicketError(err.message);
          })
          .finally(() => setLoadingTickets(false));
      }
    };

    fetchTickets();

    // Set interval to fetch tickets every 10 seconds for real-time updates
    intervalId = setInterval(fetchTickets, 10000);

    // Cleanup interval on component unmount or dependency change
    return () => clearInterval(intervalId);
  }, [token, activeSection, ticketFilter]);
  
  // Reset userFilter to null when switching away from viewUsers
  useEffect(() => {
    if (activeSection !== 'viewUsers') {
      setUserFilter(null);
    }
  }, [activeSection]);

  // Reset ticketFilter to null when switching away from viewTickets
  useEffect(() => {
    if (activeSection !== 'viewTickets') {
      setTicketFilter(null);
    }
  }, [activeSection]);
  
  // Update userFilter on button click
  const handleUserFilterClick = (filter) => {
    setUserFilter(filter);
  };

  // Update ticketFilter on button click
  const handleTicketFilterClick = (filter) => {
    setTicketFilter(filter);
  };

  useEffect(() => {
    if (activeSection === 'viewProfile' && token && userId) {
      setLoading(true);
      const authHeader = `Bearer ${token}`;
      fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: { Authorization: authHeader }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })
        .then(data => {
          setProfile(data);
          setError(null);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [activeSection, token, userId]);

  // Fetch users based on active section and filter
  useEffect(() => {
    if (activeSection === 'viewUsers' && token && userFilter) {
      setLoadingUsers(true);
      setUserError(null);
      let url = '';
      if (userFilter === 'agents') {
        url = 'http://localhost:8080/api/users/agents';
      } else if (userFilter === 'customers') {
        url = 'http://localhost:8080/api/users/customers';
      }
      if (!url) return;
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch users');
          return res.json();
        })
        .then(data => {
          setUsers(data);
          setUserError(null);
        })
        .catch(err => setUserError(err.message))
        .finally(() => setLoadingUsers(false));
    } else {
      setUsers([]); // Clear users if no filter
    }
  }, [activeSection, userFilter, token]);

  useEffect(() => {
    if (activeSection === 'viewComments' && token) {
      fetch('http://localhost:8080/api/comments/getcomments', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch comments');
          return res.json();
        })
        .then(data => setComments(data))
        .catch(err => setError(err.message));
    }
  }, [activeSection, token]);

  const [selectedTicketForComments, setSelectedTicketForComments] = useState(''); // Add this state

  // Filter comments based on selected ticket
  const filteredComments = selectedTicketForComments
    ? comments.filter(comment => String(comment.ticketId) === String(selectedTicketForComments))
    : comments;

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100">
      <AdminSidebar onSelect={setActiveSection} />
      <main className="flex-grow p-8 ml-64 max-w-6xl mx-auto">
        <>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {activeSection === 'viewUsers' && (
            <section className="mb-8">
             
              <div className="mb-4 flex space-x-6 justify-center">
                <div
                  onClick={() => handleUserFilterClick(userFilter === 'agents' ? null : 'agents')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUserFilterClick(userFilter === 'agents' ? null : 'agents'); }}
                  className={`cursor-pointer flex flex-col justify-center items-center w-56 h-24 rounded-lg shadow-lg transition-colors duration-300 ${
                    userFilter === 'agents' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-blue-400 hover:text-white'
                  }`}
                >
                 
                  <span className="mt-2 text-lg font-semibold">Engineers</span>
                   <span className="text-4xl font-bold">{agentCount}</span>
                </div>
                <div
                  onClick={() => handleUserFilterClick(userFilter === 'customers' ? null : 'customers')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUserFilterClick(userFilter === 'customers' ? null : 'customers'); }}
                  className={`cursor-pointer flex flex-col justify-center items-center w-56 h-24 rounded-lg shadow-lg transition-colors duration-300 ${
                    userFilter === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-blue-400 hover:text-white'
                  }`}
                >
                  
                  <span className="mt-2 text-lg font-semibold">Employees</span>
                  <span className="text-4xl font-bold">{customerCount}</span>
                </div>
              </div>
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : userError ? (
                <p className="text-red-600 mb-4">{userError}</p>
              ) : users.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-300 rounded">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-left">ID</th>
                      <th className="border px-4 py-2 text-left">Username</th>
                      <th className="border px-4 py-2 text-left">Email</th>
                      {/* <th className="border px-4 py-2 text-left">Role</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-100">
                        <td className="border px-4 py-2">{user.id}</td>
                        <td className="border px-4 py-2">{user.username}</td>
                        <td className="border px-4 py-2">{user.email}</td>
                        {/* <td className="border px-4 py-2">
                          {user.role === 'AGENT' ? 'Engineer' : user.role}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </section>
          )}

          {activeSection === 'viewTickets' && (
            <section className="mb-8">
              {/* <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                Tickets
                {ticketFilter === null
                  ? ` (Total: ${allTickets.length})`
                  : ` (Showing: ${tickets.length})`}
              </h2> */}
              <div className="mb-6 flex justify-center">
                <div className="flex flex-col justify-center items-center w-56 h-14 rounded-lg shadow-lg bg-blue-600 text-white">
                  <span className="mt-2 text-lg font-semibold">Total Tickets</span>
                  <span className="text-2xl font-bold">{allTickets.length}</span>
                  
                </div>
              </div>
              <div className="mb-4 flex space-x-6 justify-center">
                <div
                  onClick={() => handleTicketFilterClick(ticketFilter === 'open' ? null : 'open')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTicketFilterClick(ticketFilter === 'open' ? null : 'open'); }}
                  className={`cursor-pointer flex flex-col justify-center items-center w-56 h-24 rounded-lg shadow-lg transition-colors duration-300 ${
                    ticketFilter === 'open' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-blue-400 hover:text-white'
                  }`}
                >
                 
                  <span className="mt-2 text-lg font-semibold">Open Tickets</span>
                  <span className="text-4xl font-bold">{allTickets.filter(t => t.state === 'OPEN').length}</span>
                </div>
                <div
                  onClick={() => handleTicketFilterClick(ticketFilter === 'closed' ? null : 'closed')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTicketFilterClick(ticketFilter === 'closed' ? null : 'closed'); }}
                  className={`cursor-pointer flex flex-col justify-center items-center w-56 h-24 rounded-lg shadow-lg transition-colors duration-300 ${
                    ticketFilter === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-blue-400 hover:text-white'
                  }`}
                >
                 
                  <span className="mt-2 text-lg font-semibold">Closed Tickets</span>
                  <span className="text-4xl font-bold">{allTickets.filter(t => t.state === 'CLOSED').length}</span>
                </div>
                <div
                  onClick={() => handleTicketFilterClick(ticketFilter === 'assigned' ? null : 'assigned')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTicketFilterClick(ticketFilter === 'assigned' ? null : 'assigned'); }}
                  className={`cursor-pointer flex flex-col justify-center items-center w-56 h-24 rounded-lg shadow-lg transition-colors duration-300 ${
                    ticketFilter === 'assigned' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-blue-400 hover:text-white'
                  }`}
                >
                
                  <span className="mt-2 text-lg font-semibold">Assigned Tickets</span>
                  <span className="text-4xl font-bold">{allTickets.filter(t => t.state === 'ASSIGNED').length}</span>
                </div>
              </div>
              {ticketFilter !== null && (
                loadingTickets ? (
                  <p>Loading tickets...</p>
                ) : ticketError ? (
                  <p className="text-red-600 mb-4">{ticketError}</p>
                ) : tickets.length > 0 ? (
                  <table className="min-w-full bg-white border border-gray-300 rounded">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Title</th>
                        <th className="border px-4 py-2 text-left">Description</th>
                        <th className="border px-4 py-2 text-left">Status</th>
                        <th className="border px-4 py-2 text-left">Created By</th>
                        <th className="border px-4 py-2 text-left">Agent To</th>
                        <th className="border px-4 py-2 text-left">Opened Time</th>
                        <th className='border px-4 py-2 text-left'>Closed Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-100">
                          <td className="border px-4 py-2">{ticket.id}</td>
                          <td className="border px-4 py-2">{ticket.title}</td>
                          <td className="border px-4 py-2">{ticket.description}</td>
                          <td className="border px-4 py-2">{ticket.state}</td>
                          <td className="border px-4 py-2">
                            {ticket.createdBy && ticket.createdBy.username ? ticket.createdBy.username : 'N/A'}
                          </td>
                          <td className="border px-4 py-2">
                            {ticket.assignedAgent && ticket.assignedAgent.username
                              ? ticket.assignedAgent.username
                              : ticket.state === 'ASSIGNED'
                              ? 'Assigned'
                              : 'Unassigned'}
                          </td>
                          <td className="border px-4 py-2">
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="border px-4 py-2">
                            {ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No tickets found for this filter.</p>
                )
              )}
            </section>
          )}

          {activeSection === 'assignTickets' && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">Assign Tickets</h2>
              <div className="mb-4">
                <label htmlFor="ticketSelect" className="block mb-1 font-medium">Select Ticket</label>
                <select
                  id="ticketSelect"
                  value={selectedTicketAssign || ''}
                  onChange={(e) => setSelectedTicketAssign(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
                >
                  <option value="" disabled>Select a ticket</option>
                  {openTickets.map(ticket => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.title} (Assigned to: {ticket.assignedAgent ? ticket.assignedAgent.username : 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="agentSelect" className="block mb-1 font-medium">Assign to Engineer</label>
                <select
                  id="agentSelect"
                  value={selectedAgent || ''}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
                >
                  <option value="" disabled>Select an Engineer</option>
                  {availableAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.username}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={assignTicket}
                disabled={!selectedTicketAssign || !selectedAgent}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Assign Ticket
              </button>
            </section>
          )}

          {activeSection === 'viewProfile' && (
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
                    <p className="text-lg font-medium"><strong>Role:</strong> {profile.role}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === 'viewComments' && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">Comments</h2>
              <div className="mb-4">
                <label htmlFor="ticketCommentFilter" className="block mb-1 font-medium">Filter by Ticket</label>
                <select
                  id="ticketCommentFilter"
                  value={selectedTicketForComments}
                  onChange={e => setSelectedTicketForComments(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
                >
                  <option value="">Select a ticket</option>
                  {allTickets.map(ticket => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.title} (ID: {ticket.id})
                    </option>
                  ))}
                </select>
              </div>
              {(selectedTicketForComments !== '') && (
                <table className="min-w-full bg-white border border-gray-300 rounded">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-left">ID</th>
                      <th className="border px-4 py-2 text-left">Content</th>
                      <th className="border px-4 py-2 text-left">Ticket ID</th>
                      <th className="border px-4 py-2 text-left">User ID</th>
                      <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.length > 0 ? filteredComments.map(comment => (
                      <tr key={comment.id} className="hover:bg-gray-100">
                        <td className="border px-4 py-2">{comment.id}</td>
                        <td className="border px-4 py-2">
                          <div>
                            {comment.content}
                            <br />
                            <small className="text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(comment.createdAt).toLocaleTimeString('en-GB')}
                            </small>
                          </div>
                        </td>
                        <td className="border px-4 py-2">{comment.ticketTitle || comment.ticketId || 'N/A'}</td>
                        <td className="border px-4 py-2">{comment.username || 'N/A'}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4">No comments found for this ticket.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              {editCommentId !== null && (
                <div className="mt-4">
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                    rows={4}
                  />
                  <button
                    onClick={handleUpdateComment}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                  >
                    Update Comment
                  </button>
                  <button
                    onClick={() => setEditCommentId(null)}
                    className="ml-2 bg-gray-400 text-white px-4 py-2 rounded mt-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      </main>
      {activeSection === 'createAdmin' && (
        <section className="mb-8 max-w-md mx-auto bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Create New Admin</h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label htmlFor="adminUsername" className="block mb-1 font-medium">Username</label>
              <input
                id="adminUsername"
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
            <div>
              <label htmlFor="adminEmail" className="block mb-1 font-medium">Email</label>
              <input
                id="adminEmail"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="adminPassword" className="block mb-1 font-medium">Password</label>
              <input
                id="adminPassword"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Create Admin
            </button>
          </form>
          {adminCreationMessage && (
            <p className="mt-4 text-center text-sm text-green-600">{adminCreationMessage}</p>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;
