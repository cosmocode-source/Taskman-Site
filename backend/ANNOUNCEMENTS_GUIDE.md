# Managing Announcements

## Overview
Announcements are now dynamically fetched from the MongoDB database instead of being hardcoded.

## Database Model
Location: `backend/models/Announcement.js`

Fields:
- `title` (required) - The announcement headline
- `description` (required) - The announcement details
- `icon` (optional) - FontAwesome icon class (default: 'fas fa-bullhorn')
- `priority` (optional) - 'low', 'medium', or 'high' (default: 'medium')
- `isActive` (optional) - Boolean to show/hide (default: true)
- `createdBy` (optional) - Reference to User who created it
- `timestamps` - Auto-generated createdAt and updatedAt

## API Endpoints

### Get All Active Announcements
```
GET http://localhost:5001/api/announcements
```

### Create New Announcement
```
POST http://localhost:5001/api/announcements
Body: {
  "title": "New Announcement",
  "description": "Announcement details here",
  "icon": "fas fa-info-circle",
  "priority": "high"
}
```

### Delete Announcement
```
DELETE http://localhost:5001/api/announcements/:id
```

## Seeding Sample Data

To add sample announcements to your database:

```bash
cd backend
node seedAnnouncements.js
```

This will:
1. Clear all existing announcements
2. Add 3 sample announcements

## Adding Announcements Manually

You can use any MongoDB client (MongoDB Compass, Studio 3T, or mongosh) to add announcements directly:

```javascript
db.announcements.insertOne({
  title: "Your Title",
  description: "Your description",
  icon: "fas fa-rocket",
  priority: "high",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Icon Options

Use any FontAwesome icon. Popular choices:
- `fas fa-bullhorn` - General announcements
- `fas fa-tools` - Maintenance
- `fas fa-users` - Community/Team events
- `fas fa-rocket` - New features
- `fas fa-info-circle` - Information
- `fas fa-exclamation-triangle` - Warnings
- `fas fa-gift` - Special offers
- `fas fa-calendar` - Events

## Dashboard Display

The Dashboard will:
- Show all active announcements (`isActive: true`)
- Display up to 10 most recent announcements
- Show "No announcements at the moment" if none exist
- Allow clicking "View All Announcements" link (to be implemented)
