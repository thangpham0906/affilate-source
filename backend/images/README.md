# User Profile Images
This directory stores user profile images uploaded via API.

## Path Structure
```
/images/users/
├── user_1_1731628800000-123456789.jpg
├── user_2_1731628900000-987654321.png
└── ...
```

## Naming Convention
Format: `user_{userId}_{timestamp}-{random}.{ext}`

Example: `user_123_1731628800000-987654321.jpg`

## Access
Images can be accessed via:
```
http://localhost:3000/images/users/{filename}
```

## File Limits
- Maximum size: 5MB
- Allowed formats: jpg, jpeg, png, gif, webp
