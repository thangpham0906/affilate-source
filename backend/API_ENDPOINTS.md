# API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication Module

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "image": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Validation Rules:**
- `username`: Required, 3-30 characters, alphanumeric and underscore only
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `name`: Required, 1-100 characters
- `role`: Optional, must be 'user' or 'admin' (default: 'user')

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Username or email already exists

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and get tokens

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "image": "images/users/user_1_1731628800000-123456789.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

---

### 3. Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user and invalidate refresh token

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

### 4. Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token
- `403 Forbidden`: Token not found in database

---

### 5. Get Profile
**Endpoint:** `GET /api/auth/profile`

**Description:** Get current user's profile

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "image": "images/users/user_1_1731628800000-123456789.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z"
    }
  }
}
```

**Image URL:**
If image exists, it can be accessed at:
```
http://localhost:3000/images/users/user_1_1731628800000-123456789.jpg
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

### 6. Change Password
**Endpoint:** `PUT /api/auth/change-password`

**Description:** Change current user's password

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Validation Rules:**
- `currentPassword`: Required
- `newPassword`: Required, minimum 6 characters
- `confirmPassword`: Required, must match newPassword

**Error Responses:**
- `400 Bad Request`: Validation errors or passwords don't match
- `401 Unauthorized`: Current password incorrect

---

### 7. Upload Profile Image
**Endpoint:** `POST /api/auth/upload-image`

**Description:** Upload user profile image

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
image: [File]
```

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/upload-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@profile.jpg"
```

**Example with JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3000/api/auth/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "images/users/user_1_1731628800000-123456789.jpg"
  }
}
```

**File Constraints:**
- **Maximum size:** 5MB
- **Allowed formats:** jpg, jpeg, png, gif, webp
- **Storage path:** `/images/users/`
- **Naming:** `user_{userId}_{timestamp}-{random}.{ext}`

**Behavior:**
- If user already has an image, the old file is automatically deleted
- Only one image per user is stored
- Image path is saved in database `users.image` field

**Error Responses:**
- `400 Bad Request`: No file uploaded or validation failed
- `401 Unauthorized`: Invalid or missing token
- `413 Payload Too Large`: File exceeds 5MB
- `415 Unsupported Media Type`: Invalid file format

**Error Examples:**
```json
{
  "status": "error",
  "message": "File too large. Maximum size is 5MB"
}
```

```json
{
  "status": "error",
  "message": "Invalid file type. Only jpeg, jpg, png, gif, webp are allowed"
}
```

---

### 8. Delete Profile Image
**Endpoint:** `DELETE /api/auth/delete-image`

**Description:** Delete user's profile image

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Image deleted successfully"
}
```

**Behavior:**
- Deletes physical file from `/images/users/`
- Sets `users.image` field to NULL in database
- If no image exists, returns 404

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User has no profile image

---

## Token Information

### Access Token
- **Expiry:** 15 minutes
- **Usage:** Include in `Authorization` header as `Bearer {token}`
- **Storage:** Recommended in memory (JavaScript variable)

### Refresh Token
- **Expiry:** 7 days
- **Usage:** Use to get new access token via `/api/auth/refresh-token`
- **Storage:** Recommended in httpOnly cookie or secure storage
- **Database:** Stored in `users.refreshToken` field

---

## Error Response Format

All errors follow this structure:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 415 | Unsupported Media Type | Invalid file format |
| 500 | Internal Server Error | Server error |

---

## Testing with Postman

### Setup Environment Variables
```
baseUrl: http://localhost:3000/api
accessToken: [Set after login]
refreshToken: [Set after login]
```

### Collection Structure
1. **Auth - Register**
   - Method: POST
   - URL: `{{baseUrl}}/auth/register`
   - Body: raw JSON

2. **Auth - Login**
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Body: raw JSON
   - Tests: Save tokens to environment

3. **Auth - Get Profile**
   - Method: GET
   - URL: `{{baseUrl}}/auth/profile`
   - Headers: `Authorization: Bearer {{accessToken}}`

4. **Auth - Upload Image**
   - Method: POST
   - URL: `{{baseUrl}}/auth/upload-image`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Body: form-data
   - Key: `image` (File)

5. **Auth - Delete Image**
   - Method: DELETE
   - URL: `{{baseUrl}}/auth/delete-image`
   - Headers: `Authorization: Bearer {{accessToken}}`

---

## Image Upload Examples

### HTML Form
```html
<form id="uploadForm" enctype="multipart/form-data">
  <input type="file" id="imageInput" accept="image/*" required>
  <button type="submit">Upload</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('image', document.getElementById('imageInput').files[0]);
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Image URL:', 'http://localhost:3000/' + data.data.imageUrl);
      // Display image
      document.getElementById('profileImage').src = 'http://localhost:3000/' + data.data.imageUrl;
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
});
</script>
```

### React Component
```jsx
import { useState } from 'react';

function ProfileImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        setImageUrl('http://localhost:3000/' + data.data.imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={uploading}
      />
      {imageUrl && <img src={imageUrl} alt="Profile" />}
    </div>
  );
}
```

### Node.js (axios)
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function uploadImage(filePath, accessToken) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/upload-image',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log('Image URL:', response.data.data.imageUrl);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
uploadImage('./profile.jpg', 'YOUR_ACCESS_TOKEN');
```

---

## Security Notes

1. **Always use HTTPS in production**
2. **Store tokens securely:**
   - Access token: Memory or sessionStorage
   - Refresh token: httpOnly cookie (preferred) or secure storage
3. **Never expose tokens in URLs or logs**
4. **Implement rate limiting for upload endpoints**
5. **Validate file types on both client and server**
6. **Scan uploaded files for malware in production**
7. **Use CDN or cloud storage (AWS S3, Cloudinary) for production images**

---

## Next Steps

- [ ] Add pagination for user lists
- [ ] Implement image cropping/resizing
- [ ] Add social media authentication
- [ ] Create admin endpoints for user management
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add two-factor authentication
