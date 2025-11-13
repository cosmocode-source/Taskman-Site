import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { discussionsAPI } from '../services/api'
import './Pages.css'

function Discussion() {
  const { projectId } = useParams()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true)
        const response = await discussionsAPI.getByProject(projectId)
        setDiscussions(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load discussions')
        console.error('Error fetching discussions:', err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchDiscussions()
    }
  }, [projectId])

  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await discussionsAPI.create({
        projectId,
        author: user._id,
        message: newMessage
      })
      setDiscussions([response.data, ...discussions])
      setNewMessage('')
    } catch (err) {
      console.error('Error posting message:', err)
      alert('Failed to post message')
    }
  }

  const handleSubmitReply = async (discussionId) => {
    if (!replyMessage.trim()) return

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await discussionsAPI.addReply(discussionId, {
        author: user._id,
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

  if (loading) {
    return (
      <>
        <Nav />
        <div className="discussion-page">
          <div className="page-header">
            <h1>Discussion</h1>
          </div>
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading discussions...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="discussion-page">
          <div className="page-header">
            <h1>Discussion</h1>
          </div>
          <div className="error">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="discussion-page">
        <div className="page-header">
          <h1>Discussion</h1>
        </div>

        <form onSubmit={handleSubmitMessage} className="discussion-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Start a new discussion..."
            rows="3"
            className="discussion-textarea"
          />
          <button type="submit" className="btn-primary">
            <i className="fas fa-paper-plane"></i>
            Post Message
          </button>
        </form>

        <div className="discussion-list">
          {discussions.length === 0 ? (
            <div className="loading">
              <i className="fas fa-comments"></i>
              <p>No discussions yet. Start the conversation!</p>
            </div>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion._id} className="discussion-card">
                <div className="discussion-header">
                  <img 
                    src={discussion.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={discussion.author?.name || 'User'}
                    className="user-avatar"
                  />
                  <div className="discussion-info">
                    <div className="discussion-author">
                      {discussion.author?.name || 'Unknown User'}
                    </div>
                    <div className="discussion-time">
                      {formatTime(discussion.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="discussion-message">
                  {discussion.message}
                </div>
                <div className="discussion-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setReplyingTo(discussion._id)}
                  >
                    <i className="fas fa-reply"></i>
                    Reply
                  </button>
                  {discussion.replies && discussion.replies.length > 0 && (
                    <span className="replies-count">
                      {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>

                {discussion.replies && discussion.replies.length > 0 && (
                  <div className="replies-list">
                    {discussion.replies.map((reply, idx) => (
                      <div key={idx} className="reply-card">
                        <div className="discussion-header">
                          <img 
                            src={reply.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={reply.author?.name || 'User'}
                            className="user-avatar"
                          />
                          <div className="discussion-info">
                            <div className="discussion-author">
                              {reply.author?.name || 'Unknown User'}
                            </div>
                            <div className="discussion-time">
                              {formatTime(reply.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="discussion-message">
                          {reply.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {replyingTo === discussion._id && (
                  <div className="reply-form">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write your reply..."
                      rows="2"
                      className="discussion-textarea"
                    />
                    <div className="reply-actions">
                      <button 
                        type="button"
                        onClick={() => handleSubmitReply(discussion._id)}
                        className="btn-primary"
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
                        className="btn-cancel"
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
      </div>
    </>
  )
}

export default Discussion
