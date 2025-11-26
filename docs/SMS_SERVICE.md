# SMS Service Documentation

## Overview

The SMS service provides text message sending capabilities via Twilio for the Astralis scheduling agent. It includes graceful degradation when Twilio credentials are not configured, ensuring the system continues to function without SMS capabilities.

## Features

- **Twilio Integration**: Send SMS via Twilio API
- **Graceful Fallback**: Skip SMS sending if credentials not configured (no crashes)
- **Message Templates**: Pre-built templates for confirmations, reminders, and cancellations
- **Character Limit Enforcement**: Automatically truncates messages to 160 characters
- **Phone Number Validation**: Validates E.164 format
- **TypeScript Support**: Full type safety and IntelliSense

## Setup

### 1. Install Twilio

```bash
npm install twilio
npm install --save-dev @types/twilio
```

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+15551234567
```

**Where to find these values:**

1. Sign up for Twilio: https://www.twilio.com/try-twilio
2. Get Account SID and Auth Token from: https://console.twilio.com/
3. Get a phone number from: https://console.twilio.com/phone-numbers

### 3. Phone Number Format

All phone numbers must be in E.164 format:
- **Format**: `+[country code][subscriber number]`
- **US Example**: `+15551234567`
- **UK Example**: `+442071234567`
- **Length**: 1-15 digits after the `+`

## Usage

### Basic SMS Sending

```typescript
import { smsService } from '@/lib/services/sms.service';

// Send a simple SMS
const result = await smsService.sendSms(
  '+15551234567',
  'Your meeting is confirmed!'
);

if (result.success) {
  console.log('SMS sent:', result.messageId);
} else if (result.skipped) {
  console.log('SMS skipped (Twilio not configured)');
} else {
  console.error('SMS failed:', result.error);
}
```

### Using Message Templates

#### Confirmation SMS

```typescript
import { smsService } from '@/lib/services/sms.service';

const result = await smsService.sendConfirmation('+15551234567', {
  meetingTitle: 'Project Review',
  startTime: new Date('2025-01-15T14:00:00'),
  location: 'Conference Room A',
  duration: 60
});
```

**Example Message:**
```
✓ Project Review confirmed for Jan 15 at 2:00 PM @ Conference Room A
```

#### Reminder SMS

```typescript
const result = await smsService.sendReminder('+15551234567', {
  meetingTitle: 'Project Review',
  startTime: new Date('2025-01-15T14:00:00'),
  location: 'Conference Room A',
  duration: 60
});
```

**Example Message:**
```
⏰ Reminder: Project Review Jan 15 at 2:00 PM @ Conference Room A
```

#### Cancellation SMS

```typescript
const result = await smsService.sendCancellation('+15551234567', {
  meetingTitle: 'Project Review',
  startTime: new Date('2025-01-15T14:00:00'),
  duration: 60
});
```

**Example Message:**
```
✗ Project Review on Jan 15 at 2:00 PM has been cancelled.
```

## Integration with Scheduling Agent

The SMS service is integrated into the scheduling agent processor at:
`src/workers/processors/schedulingAgent.processor.ts`

### Sending SMS Responses

```typescript
// Queue an SMS response
await queueSendResponse({
  taskId: 'task-123',
  userId: 'user-456',
  responseType: 'confirmation',
  channel: 'sms',
  recipientPhone: '+15551234567'
});
```

### Response Types

| Response Type | Description | SMS Behavior |
|--------------|-------------|--------------|
| `confirmation` | Meeting scheduled successfully | Sends confirmation with meeting details |
| `reminder` | Upcoming meeting reminder | Sends reminder with meeting details |
| `alternatives` | Scheduling conflicts detected | Directs user to check email for alternatives |
| `clarification` | More information needed | Directs user to check email for details |
| `error` | Processing error occurred | Directs user to check email for details |

## API Reference

### `smsService.sendSms(to, message, options?)`

Send a plain text SMS message.

**Parameters:**
- `to` (string): Recipient phone number in E.164 format
- `message` (string): SMS message body (max 160 characters recommended)
- `options` (SmsOptions, optional):
  - `from` (string): Override sender phone number
  - `statusCallback` (string): URL for delivery receipts
  - `maxLength` (number): Maximum message length (default: 160)

**Returns:** `Promise<SmsResult>`
- `success` (boolean): Whether SMS was sent successfully
- `messageId` (string): Twilio message SID (if successful)
- `error` (string): Error message (if failed)
- `skipped` (boolean): True if skipped due to missing credentials

### `smsService.sendConfirmation(to, details, options?)`

Send a confirmation SMS using the built-in template.

**Parameters:**
- `to` (string): Recipient phone number
- `details` (MeetingDetails):
  - `meetingTitle` (string): Meeting title
  - `startTime` (Date): Meeting start time
  - `location` (string, optional): Meeting location
  - `duration` (number, optional): Duration in minutes
- `options` (SmsOptions, optional): Additional options

**Returns:** `Promise<SmsResult>`

### `smsService.sendReminder(to, details, options?)`

Send a reminder SMS using the built-in template.

**Parameters:** Same as `sendConfirmation()`

**Returns:** `Promise<SmsResult>`

### `smsService.sendCancellation(to, details, options?)`

Send a cancellation SMS using the built-in template.

**Parameters:** Same as `sendConfirmation()`

**Returns:** `Promise<SmsResult>`

### `smsService.isReady()`

Check if the SMS service is configured and ready to send messages.

**Returns:** `boolean` - True if Twilio credentials are configured

## Error Handling

The SMS service uses graceful degradation:

1. **Missing Credentials**: Logs warning, returns `{ success: false, skipped: true }`
2. **Invalid Phone Number**: Returns `{ success: false, error: 'Invalid phone number format' }`
3. **Twilio API Error**: Returns `{ success: false, error: 'Twilio error message' }`
4. **Network Error**: Returns `{ success: false, error: 'Network error message' }`

**Important:** The service will NEVER crash your application if Twilio is not configured. It will simply log a warning and skip SMS sending.

## Character Limits

- **Standard SMS**: 160 characters
- **GSM-7 Encoding**: 160 characters
- **UCS-2/UTF-16 (Unicode)**: 70 characters

The service automatically truncates messages longer than the specified limit (default: 160) by adding "..." at the end.

**Example:**
```typescript
// Message: "This is a very long message that exceeds..." (163 chars)
// Truncated: "This is a very long message that exce..." (160 chars)
```

## Best Practices

### 1. Always Handle Results

```typescript
const result = await smsService.sendSms(phone, message);

if (result.skipped) {
  // Log but don't fail - SMS is optional
  console.log('SMS skipped:', result.error);
} else if (!result.success) {
  // Log error but don't throw - graceful degradation
  console.error('SMS failed:', result.error);
} else {
  console.log('SMS sent:', result.messageId);
}
```

### 2. Validate Phone Numbers

```typescript
// Good: E.164 format
await smsService.sendSms('+15551234567', message);

// Bad: Missing country code
await smsService.sendSms('5551234567', message);

// Bad: Invalid format
await smsService.sendSms('(555) 123-4567', message);
```

### 3. Keep Messages Concise

```typescript
// Good: Short and clear
"✓ Meeting confirmed for today at 2pm"

// Bad: Too wordy
"Your meeting has been successfully scheduled and confirmed for today at 2:00pm in Conference Room A with John Doe"
```

### 4. Use Templates for Consistency

```typescript
// Good: Use templates
await smsService.sendConfirmation(phone, meetingDetails);

// Avoid: Manual message construction
await smsService.sendSms(phone, `Meeting: ${title} at ${time}`);
```

## Testing

### Without Twilio Credentials

```typescript
// Service will gracefully skip SMS sending
const result = await smsService.sendSms('+15551234567', 'Test');

expect(result.skipped).toBe(true);
expect(result.success).toBe(false);
```

### With Twilio Test Credentials

Twilio provides test credentials for development:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15005550006  # Magic test number
```

Magic phone numbers for testing:
- `+15005550006` - Valid test number (success)
- `+15005550007` - Invalid number (error)
- `+15005550008` - Cannot route to this number (error)
- `+15005550009` - Cannot send to this number (error)

See: https://www.twilio.com/docs/iam/test-credentials

## Troubleshooting

### SMS Not Sending

1. **Check credentials**: Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` are set
2. **Check phone format**: Ensure E.164 format (`+15551234567`)
3. **Check Twilio balance**: Ensure your Twilio account has sufficient balance
4. **Check logs**: Look for `[SmsService]` log entries

### Message Truncated

Messages over 160 characters are automatically truncated. To avoid:
- Keep messages concise
- Use abbreviations (e.g., "mtg" instead of "meeting")
- Remove unnecessary words

### Delivery Failed

Check Twilio logs: https://console.twilio.com/monitor/logs/sms

Common issues:
- Invalid phone number
- Phone number cannot receive SMS
- Carrier blocking
- Insufficient Twilio balance

## Cost Considerations

Twilio SMS pricing varies by country:
- **US/Canada**: ~$0.0075 per message
- **UK**: ~$0.04 per message
- **Other countries**: Varies

See: https://www.twilio.com/pricing/messaging

**Recommendation**: Monitor usage and set up billing alerts in Twilio console.

## Security

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Rotate tokens regularly**: Especially if exposed
3. **Use separate accounts**: Different accounts for dev/staging/prod
4. **Monitor usage**: Watch for unusual activity in Twilio console

## Support

- **Twilio Documentation**: https://www.twilio.com/docs/sms
- **Twilio Support**: https://support.twilio.com/
- **Astralis Documentation**: See `docs/` directory
