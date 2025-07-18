# Security Configuration

## Admin Authentication

The admin panel is now properly secured with authentication. Here's how to configure it securely:

### 1. Environment Variables

Create a `.env.local` file in the `runway-frontend` directory with the following variables:

```env
# Admin Authentication Credentials
# CHANGE THESE TO SECURE CREDENTIALS IN PRODUCTION
NEXT_PUBLIC_ADMIN_USERNAME=your_secure_username
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

### 2. Security Recommendations

1. **Use Strong Passwords**: 
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, and special characters
   - Avoid common words or patterns

2. **Environment Variables**:
   - Never commit `.env.local` to version control
   - Use different credentials for development and production
   - Rotate passwords regularly

3. **Production Deployment**:
   - Set environment variables in your hosting platform (Vercel, Netlify, etc.)
   - Enable HTTPS in production
   - Consider implementing rate limiting

### 3. Current Security Features

- ✅ Middleware protection for all `/admin/*` routes
- ✅ Client-side authentication checks
- ✅ Secure cookie settings with expiration
- ✅ Automatic logout on token expiration
- ✅ Redirect to signin page for unauthenticated users

### 4. Default Credentials (Development Only)

For development, the default credentials are:
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT**: Change these immediately in production!

### 5. Authentication Flow

1. User visits any `/admin/*` route
2. Middleware checks for `auth_token` cookie
3. If not authenticated, redirects to `/signin`
4. After successful login, user is redirected to the originally requested page
5. Session expires after 24 hours

### 6. Logout

Users can logout using the "Sign Out" button in the admin sidebar, which clears all authentication cookies and redirects to the home page. 