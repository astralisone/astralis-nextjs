/**
 * Google Calendar Integration Service
 *
 * Provides complete integration with Google Calendar API including:
 * - OAuth2 authentication flow
 * - Token management with auto-refresh
 * - Event CRUD operations
 * - Bi-directional sync with local database
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';

// Environment configuration
const GOOGLE_CALENDAR_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || '';
const GOOGLE_CALENDAR_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '';
const GOOGLE_CALENDAR_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3001/api/calendar/callback';

/**
 * Interface for Google Calendar event data
 */
interface GoogleEventData {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

/**
 * Initialize OAuth2 client for a specific user
 *
 * @param userId - User ID to initialize client for
 * @returns Configured OAuth2Client instance
 */
export async function initClient(userId: string): Promise<OAuth2Client> {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET,
    GOOGLE_CALENDAR_REDIRECT_URI
  );

  // Load stored credentials if they exist
  const connection = await prisma.calendarConnection.findFirst({
    where: {
      userId,
      provider: 'GOOGLE',
      isActive: true,
    },
  });

  if (connection && connection.accessToken) {
    oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken || undefined,
      expiry_date: connection.expiresAt?.getTime(),
    });

    // Check if token needs refresh
    if (connection.expiresAt && connection.expiresAt < new Date()) {
      await refreshAccessToken(userId);
    }
  }

  return oauth2Client;
}

/**
 * Generate Google OAuth authorization URL
 *
 * @param userId - User ID to associate with the auth flow
 * @returns Authorization URL for user to visit
 */
export async function generateAuthUrl(userId: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET,
    GOOGLE_CALENDAR_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId, // Pass userId in state parameter
    prompt: 'consent', // Force consent screen to get refresh token
  });

  console.log(`Generated auth URL for user ${userId}`);
  return url;
}

/**
 * Exchange authorization code for access tokens
 *
 * @param code - Authorization code from OAuth callback
 * @param userId - User ID to store tokens for
 */
export async function exchangeCodeForTokens(code: string, userId: string): Promise<void> {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET,
    GOOGLE_CALENDAR_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Get user's Google profile to get account ID
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const providerAccountId = userInfo.data.id || 'default';
    const scope = tokens.scope || 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

    // Store or update connection
    await prisma.calendarConnection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId,
          provider: 'GOOGLE',
          providerAccountId,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        isActive: true,
        lastSyncAt: new Date(),
        scope,
      },
      create: {
        userId,
        provider: 'GOOGLE',
        providerAccountId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        isActive: true,
        lastSyncAt: new Date(),
        scope,
      },
    });

    console.log(`Successfully stored tokens for user ${userId}`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Refresh expired access token using refresh token
 *
 * @param userId - User ID to refresh token for
 */
export async function refreshAccessToken(userId: string): Promise<void> {
  const connection = await prisma.calendarConnection.findFirst({
    where: {
      userId,
      provider: 'GOOGLE',
      isActive: true,
    },
  });

  if (!connection || !connection.refreshToken) {
    throw new Error('No refresh token available for user');
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET,
    GOOGLE_CALENDAR_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: connection.refreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('No access token received during refresh');
    }

    const expiresAt = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    await prisma.calendarConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: credentials.access_token,
        expiresAt,
      },
    });

    console.log(`Successfully refreshed token for user ${userId}`);
  } catch (error) {
    console.error('Error refreshing access token:', error);

    // Mark connection as inactive if refresh fails
    await prisma.calendarConnection.update({
      where: { id: connection.id },
      data: { isActive: false },
    });

    throw new Error('Failed to refresh access token');
  }
}

/**
 * Create a new event in Google Calendar
 *
 * @param userId - User ID who owns the calendar
 * @param eventData - Event data to create
 * @returns Created Google Calendar event
 */
export async function createEvent(userId: string, eventData: GoogleEventData): Promise<any> {
  const oauth2Client = await initClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
    });

    console.log(`Created Google Calendar event ${response.data.id} for user ${userId}`);
    return response.data;
  } catch (error: any) {
    // Handle token expiration with retry
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      console.log('Token expired, refreshing and retrying...');
      await refreshAccessToken(userId);

      const newClient = await initClient(userId);
      const retryCalendar = google.calendar({ version: 'v3', auth: newClient });

      const response = await retryCalendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      return response.data;
    }

    console.error('Error creating Google Calendar event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

/**
 * Update an existing event in Google Calendar
 *
 * @param userId - User ID who owns the calendar
 * @param eventId - Google Calendar event ID to update
 * @param eventData - Updated event data
 * @returns Updated Google Calendar event
 */
export async function updateEvent(userId: string, eventId: string, eventData: GoogleEventData): Promise<any> {
  const oauth2Client = await initClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: eventData,
    });

    console.log(`Updated Google Calendar event ${eventId} for user ${userId}`);
    return response.data;
  } catch (error: any) {
    // Handle token expiration with retry
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      console.log('Token expired, refreshing and retrying...');
      await refreshAccessToken(userId);

      const newClient = await initClient(userId);
      const retryCalendar = google.calendar({ version: 'v3', auth: newClient });

      const response = await retryCalendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: eventData,
      });

      return response.data;
    }

    console.error('Error updating Google Calendar event:', error);
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

/**
 * Delete an event from Google Calendar
 *
 * @param userId - User ID who owns the calendar
 * @param eventId - Google Calendar event ID to delete
 */
export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  const oauth2Client = await initClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    console.log(`Deleted Google Calendar event ${eventId} for user ${userId}`);
  } catch (error: any) {
    // Handle token expiration with retry
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      console.log('Token expired, refreshing and retrying...');
      await refreshAccessToken(userId);

      const newClient = await initClient(userId);
      const retryCalendar = google.calendar({ version: 'v3', auth: newClient });

      await retryCalendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return;
    }

    console.error('Error deleting Google Calendar event:', error);
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

/**
 * List events from Google Calendar within a time range
 *
 * @param userId - User ID who owns the calendar
 * @param timeMin - Start of time range
 * @param timeMax - End of time range
 * @returns Array of Google Calendar events
 */
export async function listEvents(userId: string, timeMin: Date, timeMax: Date): Promise<any[]> {
  const oauth2Client = await initClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500, // Maximum allowed by API
    });

    console.log(`Retrieved ${response.data.items?.length || 0} events from Google Calendar for user ${userId}`);
    return response.data.items || [];
  } catch (error: any) {
    // Handle token expiration with retry
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      console.log('Token expired, refreshing and retrying...');
      await refreshAccessToken(userId);

      const newClient = await initClient(userId);
      const retryCalendar = google.calendar({ version: 'v3', auth: newClient });

      const response = await retryCalendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500,
      });

      return response.data.items || [];
    }

    console.error('Error listing Google Calendar events:', error);
    throw new Error(`Failed to list events: ${error.message}`);
  }
}

/**
 * Sync events from Google Calendar to local database
 *
 * @param userId - User ID to sync events for
 * @returns Sync results with count and errors
 */
export async function syncFromGoogle(userId: string): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // Get events from the last 30 days and next 90 days
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);

    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 90);

    const googleEvents = await listEvents(userId, timeMin, timeMax);

    for (const event of googleEvents) {
      try {
        // Skip events without proper time data
        if (!event.start?.dateTime || !event.end?.dateTime) {
          continue;
        }

        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);

        // Check if event already exists by looking in calendarIntegrationData
        const existing = await prisma.schedulingEvent.findFirst({
          where: {
            userId,
            calendarIntegrationData: {
              path: ['googleEventId'],
              equals: event.id,
            },
          },
        });

        if (existing) {
          // Update existing event
          await prisma.schedulingEvent.update({
            where: { id: existing.id },
            data: {
              title: event.summary || 'Untitled Event',
              description: event.description,
              location: event.location,
              startTime,
              endTime,
              status: event.status === 'cancelled' ? 'CANCELLED' : existing.status,
              calendarIntegrationData: {
                googleEventId: event.id,
                provider: 'GOOGLE',
                syncedAt: new Date().toISOString(),
              },
            },
          });
        } else {
          // Create new event
          await prisma.schedulingEvent.create({
            data: {
              userId,
              title: event.summary || 'Untitled Event',
              description: event.description,
              location: event.location,
              startTime,
              endTime,
              calendarIntegrationData: {
                googleEventId: event.id,
                provider: 'GOOGLE',
                syncedAt: new Date().toISOString(),
              },
              status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
            },
          });
        }

        synced++;
      } catch (eventError: any) {
        console.error(`Error syncing event ${event.id}:`, eventError);
        errors.push(`Event ${event.id}: ${eventError.message}`);
      }
    }

    // Update last synced timestamp
    await prisma.calendarConnection.updateMany({
      where: {
        userId,
        provider: 'GOOGLE',
        isActive: true,
      },
      data: {
        lastSyncAt: new Date(),
      },
    });

    console.log(`Sync complete for user ${userId}: ${synced} events synced, ${errors.length} errors`);

    return { synced, errors };
  } catch (error: any) {
    console.error('Error during Google Calendar sync:', error);
    errors.push(`Sync failed: ${error.message}`);
    return { synced, errors };
  }
}

/**
 * Handle OAuth callback - wrapper for exchangeCodeForTokens
 *
 * @param code - Authorization code from OAuth callback
 * @param userId - User ID to store tokens for
 */
export async function handleOAuthCallback(code: string, userId: string): Promise<void> {
  return exchangeCodeForTokens(code, userId);
}

/**
 * Disconnect a calendar connection
 *
 * @param connectionId - Connection ID to disconnect
 * @param userId - User ID (for authorization)
 */
export async function disconnectCalendar(connectionId: string, userId: string): Promise<void> {
  try {
    // Find the connection
    const connection = await prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Calendar connection not found');
    }

    // Check ownership
    if (connection.userId !== userId) {
      throw new Error('Unauthorized: You do not own this calendar connection');
    }

    // Deactivate the connection (don't delete to preserve history)
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: {
        isActive: false,
        accessToken: '', // Clear token (required field, can't be null)
        refreshToken: null,
      },
    });

    console.log(`Disconnected calendar connection ${connectionId} for user ${userId}`);
  } catch (error: any) {
    console.error('Error disconnecting calendar:', error);
    throw error;
  }
}
