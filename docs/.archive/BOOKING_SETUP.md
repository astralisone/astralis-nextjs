# Booking System Setup Guide

This guide will help you configure the email notifications and calendar invites for the booking system.

## Overview

The booking system includes:
- **Multi-step booking form** with calendar and time selection
- **Email notifications** sent to both the customer and support team
- **ICS calendar files** attached to emails for easy calendar import
- **Professional email templates** with booking details

## Email Configuration

The system uses SMTP (Simple Mail Transfer Protocol) to send emails. You need to configure your SMTP settings in the `.env.local` file.

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"              # Your SMTP server
SMTP_PORT="587"                         # SMTP port (usually 587 or 465)
SMTP_SECURE="false"                     # Use SSL (true for port 465, false for 587)
SMTP_USER="your-email@gmail.com"        # Your email address
SMTP_PASSWORD="your-app-password"       # Your email password or app password
SMTP_FROM_NAME="Astralis"               # Name shown in "From" field
SMTP_FROM_EMAIL="support@astralisone.com"  # Email shown in "From" field
```

### Setup Instructions by Provider

#### Option 1: Gmail (Recommended for Development)

1. **Create a Gmail account** (or use existing)
2. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

3. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Astralis Booking"
   - Copy the generated 16-character password

4. **Update `.env.local`**:
   ```bash
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-gmail@gmail.com"
   SMTP_PASSWORD="your-16-char-app-password"  # No spaces
   SMTP_FROM_NAME="Astralis"
   SMTP_FROM_EMAIL="your-gmail@gmail.com"
   ```

5. **Restart your dev server**: `npm run dev`

#### Option 2: Outlook/Hotmail

1. **Update `.env.local`**:
   ```bash
   SMTP_HOST="smtp-mail.outlook.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@outlook.com"
   SMTP_PASSWORD="your-outlook-password"
   SMTP_FROM_NAME="Astralis"
   SMTP_FROM_EMAIL="your-email@outlook.com"
   ```

#### Option 3: Custom SMTP Server

If you have a custom SMTP server (e.g., from your hosting provider):

```bash
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"                    # Or 465 for SSL
SMTP_SECURE="false"                # Or "true" for port 465
SMTP_USER="support@yourdomain.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"
```

## How It Works

### Customer Flow

1. User clicks "Book a Call" on the contact page
2. Fills out 3-step booking form:
   - **Step 1**: Name, email, phone, company
   - **Step 2**: Date, time, meeting type (Video/Phone/In-Person)
   - **Step 3**: Optional message and review
3. Upon submission:
   - Customer receives confirmation email with:
     - Booking details
     - ICS calendar file attachment
     - Instructions for the meeting
   - Support team receives notification email with:
     - Customer information
     - Meeting details
     - ICS calendar file attachment

### Email Templates

Two professional HTML email templates are sent:

1. **Customer Confirmation Email** (`src/lib/email.ts`):
   - Welcome message
   - Meeting details (date, time, type)
   - What happens next
   - Reschedule information
   - ICS calendar attachment

2. **Internal Notification Email** (`src/lib/email.ts`):
   - Client information (name, email, phone, company)
   - Meeting details
   - Discussion topics (if provided)
   - Action items checklist
   - ICS calendar attachment

### Calendar Integration

The system generates ICS (iCalendar) files that work with:
- Google Calendar
- Apple Calendar
- Outlook
- Any calendar app that supports ICS format

The ICS file includes:
- Event title with client name
- Date and time
- Duration (30 minutes)
- Location (based on meeting type)
- Description with client details
- Attendees (client + organizer)

## Testing the Booking System

### 1. Configure SMTP Settings

Make sure you've added all required SMTP variables to `.env.local`

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test a Booking

1. Navigate to http://localhost:3001/contact
2. Click "Book a Call"
3. Fill out the booking form with **your own email** for testing
4. Submit the form
5. Check your email inbox for:
   - Confirmation email (customer view)
   - Check support@astralisone.com inbox for notification email

### 4. Verify Calendar File

1. Open the confirmation email
2. Download the `.ics` attachment
3. Double-click to open in your calendar app
4. Event should be added to your calendar

## Troubleshooting

### "Failed to process booking" Error

**Check the server logs** for specific error messages:
```bash
# In your terminal where npm run dev is running
# Look for errors like "SMTP connection failed"
```

**Common issues**:

1. **SMTP credentials wrong**:
   - Double-check your email and password
   - For Gmail, make sure you're using an App Password, not your regular password

2. **Port blocked**:
   - Try port 465 with `SMTP_SECURE="true"`
   - Some networks block port 587

3. **2FA not enabled** (Gmail):
   - Enable 2-Step Verification first
   - Then generate App Password

### Emails Not Being Received

1. **Check spam folder**
2. **Verify SMTP_FROM_EMAIL** is correct
3. **Check email provider logs** for bounce/rejection notices
4. **Test SMTP connection** manually:
   ```bash
   npm install -g smtp-tester
   smtp-tester --host smtp.gmail.com --port 587 --user your-email@gmail.com
   ```

### Calendar File Not Working

1. **Check ICS file** is attached to email
2. **Try opening ICS** in a text editor to verify format
3. **Update calendar app** to latest version
4. **Try different calendar app** (Google Calendar web interface is most reliable)

## Production Deployment

For production, update `.env.production` or your hosting provider's environment variables:

```bash
# Use production SMTP server
SMTP_HOST="your-production-smtp.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="support@astralisone.com"
SMTP_PASSWORD="production-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"
```

**Recommended production email services**:
- **SendGrid** - Enterprise email API
- **Amazon SES** - AWS Simple Email Service
- **Postmark** - Transactional email service
- **Mailgun** - Email automation service

## File Structure

```
src/
├── app/
│   └── api/
│       └── booking/
│           └── route.ts          # API endpoint that processes bookings
├── components/
│   └── booking/
│       └── BookingModal.tsx      # Booking form UI component
└── lib/
    ├── email.ts                  # Email service and templates
    └── calendar.ts               # ICS calendar file generation
```

## Future Enhancements

Consider adding:
- Database storage for bookings (Prisma + PostgreSQL)
- Admin dashboard to view/manage bookings
- Automated reminder emails (24 hours before)
- Video call link generation (Zoom/Google Meet API)
- Real-time availability checking
- Time zone detection and conversion
- Booking cancellation flow
- Reschedule functionality

## Support

For issues or questions:
- Email: support@astralisone.com
- Phone: +1 (341) 223-4433
