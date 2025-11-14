import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { discussionsAPI, projectsAPI } from '../services/api'

function Discussion() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [messageType, setMessageType] = useState('public')
  const [selectedMember, setSelectedMember] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState({})
  const chatEndRef = useRef(null)
  const currentUser = JSON.parse(localStorage.getItem('user'))

  // Inline Styles
  const styles = {
    pageLayout: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: 0,
      height: 'calc(100vh - 60px)',
      background: '#0f1117',
      overflow: 'hidden'
    },
    sidebar: {
      background: '#1a1d29',
      borderRight: '1px solid #2f3342',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      position: sidebarOpen ? 'fixed' : 'relative',
      left: sidebarOpen ? 0 : 'auto',
      top: sidebarOpen ? '60px' : 'auto',
      bottom: sidebarOpen ? 0 : 'auto',
      width: '320px',
      zIndex: sidebarOpen ? 99 : 'auto',
      transition: 'left 0.3s ease',
      boxShadow: sidebarOpen ? '4px 0 20px rgba(0, 0, 0, 0.5)' : 'none'
    },
    sidebarHeader: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#ffffff',
      margin: 0,
      padding: '24px 20px',
      borderBottom: '1px solid #2f3342',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: '#242731'
    },
    membersList: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    memberItem: (isActive, isAllChat) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: isAllChat 
        ? 'linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(41, 128, 185, 0.15) 100%)'
        : isActive 
        ? 'rgba(52, 152, 219, 0.15)' 
        : '#242731',
      border: isActive || isAllChat ? '1px solid #3498db' : '1px solid transparent',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      marginBottom: isAllChat ? '8px' : 0
    }),
    memberAvatar: {
      width: '42px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3498db',
      fontSize: '40px',
      flexShrink: 0,
      lineHeight: 1
    },
    memberDetails: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    memberName: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#ffffff',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    memberUsername: {
      fontSize: '13px',
      color: '#3498db',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    memberStatus: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#2ecc71',
      border: '2px solid #1a1d29',
      position: 'absolute',
      bottom: '14px',
      left: '50px'
    },
    unreadBadge: {
      background: '#e74c3c',
      color: 'white',
      fontSize: '11px',
      fontWeight: 700,
      padding: '3px 7px',
      borderRadius: '12px',
      minWidth: '20px',
      textAlign: 'center'
    },
    chatContainer: {
      background: '#242731',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    },
    chatHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 28px',
      borderBottom: '1px solid #2f3342',
      background: '#1a1d29',
      flexShrink: 0
    },
    chatHeaderInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    chatHeaderIcon: {
      fontSize: '32px',
      color: '#3498db'
    },
    chatHeaderText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    chatTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#ffffff',
      margin: 0
    },
    chatSubtitle: {
      fontSize: '14px',
      color: '#b8bec8',
      margin: 0
    },
    chatMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      background: '#242731'
    },
    chatMessage: (isOwn) => ({
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      flexDirection: isOwn ? 'row-reverse' : 'row'
    }),
    chatAvatar: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3498db',
      fontSize: '38px',
      flexShrink: 0
    },
    chatMessageContent: (isOwn) => ({
      maxWidth: '65%',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignItems: isOwn ? 'flex-end' : 'flex-start'
    }),
    chatMessageHeader: (isOwn) => ({
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px',
      flexDirection: isOwn ? 'row-reverse' : 'row'
    }),
    senderName: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#ffffff'
    },
    timestamp: {
      fontSize: '12px',
      color: '#7f8c8d'
    },
    messageBubble: (isOwn) => ({
      background: isOwn 
        ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
        : '#1a1d29',
      border: isOwn ? '1px solid #2980b9' : '1px solid #2f3342',
      borderRadius: '16px',
      padding: '12px 16px',
      color: isOwn ? 'white' : '#e4e6eb',
      fontSize: '15px',
      lineHeight: 1.5,
      wordWrap: 'break-word'
    }),
    discussionCard: {
      background: '#1a1d29',
      border: '1px solid #2f3342',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.2s ease'
    },
    discussionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3498db',
      fontSize: '38px',
      flexShrink: 0
    },
    discussionInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    discussionAuthor: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#ffffff'
    },
    discussionUsername: {
      fontWeight: 400,
      color: '#3498db',
      fontSize: '14px'
    },
    discussionTime: {
      fontSize: '13px',
      color: '#7f8c8d'
    },
    discussionMessage: {
      color: '#e4e6eb',
      fontSize: '15px',
      lineHeight: 1.6,
      marginBottom: '16px',
      whiteSpace: 'pre-wrap'
    },
    discussionActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      paddingTop: '12px',
      borderTop: '1px solid #2f3342'
    },
    actionBtn: {
      background: 'transparent',
      border: 'none',
      color: '#b8bec8',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'all 0.2s'
    },
    repliesCount: {
      fontSize: '13px',
      color: '#7f8c8d',
      marginLeft: 'auto'
    },
    repliesList: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #2f3342',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    replyCard: {
      background: '#242731',
      border: '1px solid #2f3342',
      borderRadius: '10px',
      padding: '16px'
    },
    replyForm: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #2f3342'
    },
    textarea: {
      width: '100%',
      background: '#242731',
      border: '1px solid #2f3342',
      borderRadius: '10px',
      padding: '12px 16px',
      color: '#e4e6eb',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px',
      marginBottom: '12px',
      boxSizing: 'border-box'
    },
    replyActions: {
      display: 'flex',
      gap: '12px'
    },
    btnPrimary: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    btnCancel: {
      padding: '10px 20px',
      background: 'transparent',
      border: '1px solid #e74c3c',
      borderRadius: '8px',
      color: '#e74c3c',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      textAlign: 'center'
    },
    emptyIcon: {
      fontSize: '72px',
      color: '#2f3342',
      marginBottom: '24px'
    },
    emptyTitle: {
      fontSize: '22px',
      fontWeight: 700,
      color: '#ffffff',
      margin: '0 0 12px 0'
    },
    emptyText: {
      fontSize: '15px',
      color: '#b8bec8',
      lineHeight: 1.6
    },
    inputArea: {
      padding: '20px 28px',
      borderTop: '1px solid #2f3342',
      background: '#1a1d29',
      flexShrink: 0
    },
    inputWrapper: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end'
    },
    inputGroup: {
      flex: 1
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px',
      background: '#242731',
      border: '2px solid #2f3342',
      borderRadius: '12px',
      padding: '12px 16px',
      transition: 'all 0.2s'
    },
    inputTextarea: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      color: '#e4e6eb',
      fontSize: '15px',
      fontFamily: 'inherit',
      resize: 'none',
      outline: 'none',
      padding: '4px 8px',
      maxHeight: '120px',
      minHeight: '24px',
      lineHeight: 1.5
    },
    iconBtn: {
      background: 'none',
      border: 'none',
      color: '#b8bec8',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      borderRadius: '8px',
      flexShrink: 0
    },
    sendBtn: (disabled) => ({
      background: disabled ? '#3a3f4f' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      border: 'none',
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: 'white',
      fontSize: '18px',
      flexShrink: 0,
      transition: 'all 0.2s',
      boxShadow: disabled ? 'none' : '0 2px 8px rgba(52, 152, 219, 0.4)',
      opacity: disabled ? 0.5 : 1
    }),
    toggleBtn: {
      display: 'none',
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      width: '56px',
      height: '56px',
      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      border: 'none',
      borderRadius: '50%',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(52, 152, 219, 0.4)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#e4e6eb',
      gap: '12px'
    }
  }

  useEffect(() => {
    const fetchProjectAndDiscussions = async () => {
      try {
        setLoading(true)
        
        const projectResponse = await projectsAPI.getById(projectId)
        setProject(projectResponse.data)

        const response = await discussionsAPI.getByProject(projectId, currentUser._id)
        setDiscussions(response.data.filter(d => d.type === 'public'))
        
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load discussions')
        console.error('Error fetching discussions:', err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProjectAndDiscussions()
    }
  }, [projectId])

  useEffect(() => {
    if (selectedMember) {
      fetchChatMessages(selectedMember._id)
    }
  }, [selectedMember])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatMessages = async (memberId) => {
    try {
      const response = await discussionsAPI.getChat(projectId, memberId, currentUser._id)
      setChatMessages(response.data)
    } catch (err) {
      console.error('Error fetching chat messages:', err)
    }
  }

  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const messageData = {
        projectId,
        author: currentUser._id,
        message: newMessage,
        type: messageType,
        recipient: selectedMember?._id || null
      }

      const response = await discussionsAPI.create(messageData)

      if (messageType === 'public') {
        setDiscussions([response.data, ...discussions])
      } else {
        setChatMessages([...chatMessages, response.data])
      }
      
      setNewMessage('')
    } catch (err) {
      console.error('Error posting message:', err)
      alert('Failed to post message')
    }
  }

  const handleSubmitReply = async (discussionId) => {
    if (!replyMessage.trim()) return

    try {
      const response = await discussionsAPI.addReply(discussionId, {
        author: currentUser._id,
        message: replyMessage
      })
      
      setDiscussions(discussions.map(d => 
        d._id === discussionId ? response.data : d
      ))
      setReplyingTo(null)
      setReplyMessage('')
    } catch (err) {
      console.error('Error posting reply:', err)
      alert('Failed to post reply')
    }
  }

  const handleSelectMember = (member) => {
    if (member._id === 'all') {
      setSelectedMember(null)
      setMessageType('public')
    } else {
      setSelectedMember(member)
      setMessageType('private')
    }
    setSidebarOpen(false)
  }

  const formatTime = (date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffMs = now - messageDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return messageDate.toLocaleDateString()
  }

  const formatChatTime = (date) => {
    const messageDate = new Date(date)
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div style={styles.loading}>
          <i className="fas fa-spinner fa-spin" style={{fontSize: '24px', color: '#3498db'}}></i> Loading...
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div style={styles.loading}>
          <i className="fas fa-exclamation-triangle" style={{fontSize: '24px', color: '#e74c3c'}}></i> {error}
        </div>
      </>
    )
  }

  const otherMembers = project?.members?.filter(m => m.user._id !== currentUser._id) || []

  return (
    <>
      <Nav />
      <div style={styles.pageLayout}>
        {/* Team Sidebar */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarHeader}>
            <i className="fas fa-users" style={{color: '#3498db', fontSize: '20px'}}></i> Team Members
          </h3>
          <div style={styles.membersList}>
            {/* All Team Option */}
            <div 
              style={styles.memberItem(!selectedMember, true)}
              onClick={() => handleSelectMember({ _id: 'all' })}
              onMouseEnter={(e) => {
                if (!selectedMember) return
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.25) 0%, rgba(41, 128, 185, 0.25) 100%)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                if (!selectedMember) return
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(41, 128, 185, 0.15) 100%)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div style={{...styles.memberAvatar, fontSize: '26px'}}>
                <i className="fas fa-users"></i>
              </div>
              <div style={styles.memberDetails}>
                <div style={styles.memberName}>All Team</div>
                <div style={styles.memberUsername}>Public Discussion</div>
              </div>
            </div>

            {/* Team Members */}
            {otherMembers.map((member) => (
              <div
                key={member.user._id}
                style={styles.memberItem(selectedMember?._id === member.user._id, false)}
                onClick={() => handleSelectMember(member.user)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2f3342'
                  e.currentTarget.style.borderColor = '#3498db'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  const isActive = selectedMember?._id === member.user._id
                  e.currentTarget.style.background = isActive ? 'rgba(52, 152, 219, 0.15)' : '#242731'
                  e.currentTarget.style.borderColor = isActive ? '#3498db' : 'transparent'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={styles.memberAvatar}>
                  <i className="fas fa-user-circle"></i>
                </div>
                <div style={styles.memberDetails}>
                  <div style={styles.memberName}>{member.user.name}</div>
                  <div style={styles.memberUsername}>@{member.user.username}</div>
                </div>
                <div style={styles.memberStatus}></div>
                {unreadCounts[member.user._id] && (
                  <div style={styles.unreadBadge}>{unreadCounts[member.user._id]}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Container */}
        <div style={styles.chatContainer}>
          {/* Header */}
          <div style={styles.chatHeader}>
            <div style={styles.chatHeaderInfo}>
              <i className={selectedMember ? "fas fa-user-circle" : "fas fa-users"} style={styles.chatHeaderIcon}></i>
              <div style={styles.chatHeaderText}>
                <h2 style={styles.chatTitle}>{selectedMember ? selectedMember.name : 'Team Discussion'}</h2>
                <p style={styles.chatSubtitle}>
                  {selectedMember 
                    ? `@${selectedMember.username}` 
                    : `${project?.name || 'Project'} - Public Board`}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {selectedMember ? (
            // Private Chat
            <div style={styles.chatMessages}>
              {chatMessages.length === 0 ? (
                <div style={styles.emptyState}>
                  <i className="fas fa-comments" style={styles.emptyIcon}></i>
                  <h3 style={styles.emptyTitle}>No messages yet</h3>
                  <p style={styles.emptyText}>Start a conversation with {selectedMember.name}</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => {
                    const isOwn = msg.author._id === currentUser._id
                    return (
                      <div key={msg._id} style={styles.chatMessage(isOwn)}>
                        <div style={styles.chatAvatar}>
                          <i className="fas fa-user-circle"></i>
                        </div>
                        <div style={styles.chatMessageContent(isOwn)}>
                          <div style={styles.chatMessageHeader(isOwn)}>
                            <span style={styles.senderName}>{msg.author.name}</span>
                            <span style={styles.timestamp}>{formatChatTime(msg.createdAt)}</span>
                          </div>
                          <div style={styles.messageBubble(isOwn)}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>
          ) : (
            // Public Discussion
            <div style={styles.chatMessages}>
              {discussions.length === 0 ? (
                <div style={styles.emptyState}>
                  <i className="fas fa-comments" style={styles.emptyIcon}></i>
                  <h3 style={styles.emptyTitle}>No discussions yet</h3>
                  <p style={styles.emptyText}>Start the conversation with your team!</p>
                </div>
              ) : (
                discussions.map((discussion) => (
                  <div key={discussion._id} style={styles.discussionCard}>
                    <div style={styles.discussionHeader}>
                      <div style={styles.userAvatar}>
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <div style={styles.discussionInfo}>
                        <div style={styles.discussionAuthor}>
                          {discussion.author?.name || 'Unknown User'}
                          {discussion.author?.username && (
                            <span style={styles.discussionUsername}> @{discussion.author.username}</span>
                          )}
                        </div>
                        <div style={styles.discussionTime}>
                          {formatTime(discussion.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={styles.discussionMessage}>
                      {discussion.message}
                    </div>
                    <div style={styles.discussionActions}>
                      <button 
                        style={styles.actionBtn}
                        onClick={() => setReplyingTo(discussion._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2f3342'
                          e.currentTarget.style.color = '#3498db'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#b8bec8'
                        }}
                      >
                        <i className="fas fa-reply"></i>
                        Reply
                      </button>
                      {discussion.replies && discussion.replies.length > 0 && (
                        <span style={styles.repliesCount}>
                          {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>

                    {discussion.replies && discussion.replies.length > 0 && (
                      <div style={styles.repliesList}>
                        {discussion.replies.map((reply, idx) => (
                          <div key={idx} style={styles.replyCard}>
                            <div style={styles.discussionHeader}>
                              <div style={styles.userAvatar}>
                                <i className="fas fa-user-circle"></i>
                              </div>
                              <div style={styles.discussionInfo}>
                                <div style={styles.discussionAuthor}>
                                  {reply.author?.name || 'Unknown User'}
                                  {reply.author?.username && (
                                    <span style={styles.discussionUsername}> @{reply.author.username}</span>
                                  )}
                                </div>
                                <div style={styles.discussionTime}>
                                  {formatTime(reply.createdAt)}
                                </div>
                              </div>
                            </div>
                            <div style={styles.discussionMessage}>
                              {reply.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {replyingTo === discussion._id && (
                      <div style={styles.replyForm}>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Write your reply..."
                          rows="2"
                          style={styles.textarea}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3498db'
                            e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2f3342'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <div style={styles.replyActions}>
                          <button 
                            type="button"
                            onClick={() => handleSubmitReply(discussion._id)}
                            style={styles.btnPrimary}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            <i className="fas fa-paper-plane"></i>
                            Post Reply
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyMessage('')
                            }}
                            style={styles.btnCancel}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Input Area */}
          <div style={styles.inputArea}>
            <form onSubmit={handleSubmitMessage} style={styles.inputWrapper}>
              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <button 
                    type="button" 
                    style={styles.iconBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#3498db'
                      e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#b8bec8'
                      e.currentTarget.style.background = 'none'
                    }}
                  >
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedMember 
                      ? `Message ${selectedMember.name}...` 
                      : 'Share with your team...'}
                    rows="1"
                    style={styles.inputTextarea}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitMessage(e)
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    style={styles.iconBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f39c12'
                      e.currentTarget.style.background = 'rgba(243, 156, 18, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#b8bec8'
                      e.currentTarget.style.background = 'none'
                    }}
                  >
                    <i className="fas fa-smile"></i>
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                style={styles.sendBtn(!newMessage.trim())}
                disabled={!newMessage.trim()}
                onMouseEnter={(e) => {
                  if (!newMessage.trim()) return
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.4)'
                }}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          style={{...styles.toggleBtn, display: window.innerWidth <= 1024 ? 'flex' : 'none'}}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className="fas fa-users"></i>
        </button>
      </div>
    </>
  )
}

export default Discussion
