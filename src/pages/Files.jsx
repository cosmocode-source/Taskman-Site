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
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
          <button className="btn-add">
            <i className="fas fa-upload"></i>
            Upload File
          </button>
        </div>

        {files.length === 0 ? (
          <div className="loading">
            <i className="fas fa-folder-open"></i>
            <p>No files uploaded yet</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div 
                key={file._id} 
                className="file-card"
                onClick={() => handleFileClick(file)}
              >
                <div className="file-icon">
                  <i className={getFileIcon(file.name)}></i>
                </div>
                <div className="file-name" title={file.name}>
                  {file.name}
                </div>
                <div className="file-meta">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
                {file.uploadedBy && (
                  <div className="file-uploader">
                    <img 
                      src={file.uploadedBy.avatar} 
                      alt={file.uploadedBy.name}
                      title={file.uploadedBy.name}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Files
