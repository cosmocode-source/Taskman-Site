import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { filesAPI } from '../services/api'
import './Pages.css'

function Files() {
  const { projectId } = useParams()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        const response = await filesAPI.getByProject(projectId)
        setFiles(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load files')
        console.error('Error fetching files:', err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchFiles()
    }
  }, [projectId])

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    if (typeof bytes === 'string') return bytes // Already formatted
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    const now = new Date()
    const uploadDate = new Date(date)
    const diffMs = now - uploadDate
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 24) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return uploadDate.toLocaleDateString()
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    const iconMap = {
      pdf: 'fas fa-file-pdf',
      doc: 'fas fa-file-word',
      docx: 'fas fa-file-word',
      xls: 'fas fa-file-excel',
      xlsx: 'fas fa-file-excel',
      ppt: 'fas fa-file-powerpoint',
      pptx: 'fas fa-file-powerpoint',
      jpg: 'fas fa-file-image',
      jpeg: 'fas fa-file-image',
      png: 'fas fa-file-image',
      gif: 'fas fa-file-image',
      zip: 'fas fa-file-archive',
      rar: 'fas fa-file-archive',
      txt: 'fas fa-file-alt',
      default: 'fas fa-file'
    }
    return iconMap[ext] || iconMap.default
  }

  const handleFileClick = (file) => {
    if (file.url) {
      window.open(file.url, '_blank')
    }
  }

  const handleDownload = (file, e) => {
    e.stopPropagation()
    
    // Create a download link
    const link = document.createElement('a')
    link.href = file.url || '#'
    link.download = file.name
    link.target = '_blank'
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload')
      return
    }

    setUploading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      // For now, create a simple file record (in production, you'd upload to cloud storage)
      const fileData = {
        projectId,
        name: selectedFile.name,
        size: selectedFile.size,
        url: '', // In production, this would be the cloud storage URL
        uploadedBy: user._id
      }

      const response = await filesAPI.upload(fileData)
      setFiles([response.data, ...files])
      setShowUploadModal(false)
      setSelectedFile(null)
      alert('File uploaded successfully!')
    } catch (err) {
      console.error('Error uploading file:', err)
      alert(err.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId, e) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      await filesAPI.delete(fileId)
      setFiles(files.filter(f => f._id !== fileId))
    } catch (err) {
      console.error('Error deleting file:', err)
      alert(err.response?.data?.message || 'Failed to delete file')
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="files-page">
          <div className="page-header">
            <h1>Project Files</h1>
            <button className="btn-add">
              <i className="fas fa-upload"></i>
              Upload File
            </button>
          </div>
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading files...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="files-page">
          <div className="page-header">
            <h1>Project Files</h1>
            <button className="btn-add">
              <i className="fas fa-upload"></i>
              Upload File
            </button>
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
      <div className="files-page">
        <div className="page-header">
          <h1>Project Files</h1>
          <button className="btn-add" onClick={() => setShowUploadModal(true)}>
            <i className="fas fa-upload"></i>
            Upload File
          </button>
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <p>No files uploaded yet. Click "Upload File" to get started!</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div 
                key={file._id} 
                className="file-card"
              >
                <div className="file-card-actions">
                  <button 
                    className="file-action-btn download-btn"
                    onClick={(e) => handleDownload(file, e)}
                    title="Download file"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button 
                    className="file-action-btn delete-btn"
                    onClick={(e) => handleDeleteFile(file._id, e)}
                    title="Delete file"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="file-icon" onClick={() => handleFileClick(file)}>
                  <i className={getFileIcon(file.name)}></i>
                </div>
                <div className="file-name" title={file.name}>
                  {file.name}
                </div>
                <div className="file-meta">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.createdAt || file.uploadedAt)}</span>
                </div>
                {file.uploadedBy && (
                  <div className="file-uploader">
                    <i className="fas fa-user-circle"></i>
                    <span className="uploader-name">
                      {file.uploadedBy.name}
                    </span>
                    {file.uploadedBy.username && (
                      <span className="uploader-username">@{file.uploadedBy.username}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload File</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="upload-section">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fileInput" className="file-input-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>{selectedFile ? selectedFile.name : 'Click to select a file'}</span>
                  {selectedFile && (
                    <span className="file-size-preview">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  )}
                </label>
              </div>

              {selectedFile && (
                <div className="file-preview">
                  <i className={getFileIcon(selectedFile.name)}></i>
                  <div className="file-preview-info">
                    <div className="file-preview-name">{selectedFile.name}</div>
                    <div className="file-preview-size">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i>
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Files
