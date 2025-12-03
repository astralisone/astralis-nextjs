"use strict";exports.id=4388,exports.ids=[4388],exports.modules={44388:(a,b,c)=>{c.d(b,{D3:()=>p,KG:()=>l,ZM:()=>i,du:()=>k,g$:()=>q,i3:()=>n,mk:()=>r,pE:()=>o,xj:()=>m});var d=c(39834),e=c(55511),f=c.n(e);async function g(a){let b=process.env.BREVO_API_KEY;if(!b)throw console.error("[Email] BREVO_API_KEY not configured"),Error("BREVO_API_KEY not configured");let c=process.env.SMTP_FROM_EMAIL||"no-reply@astralisone.com",d=process.env.SMTP_FROM_NAME||"Astralis One";console.log(`[Email] Attempting to send via Brevo API to ${a.to}`),console.log(`[Email] Subject: ${a.subject}`),console.log(`[Email] From: ${d} <${c}>`),console.log(`[Email] Attachments: ${a.attachments?.length||0}`);let e={sender:{email:c,name:d},to:[{email:a.to}],subject:a.subject,htmlContent:a.html};a.text&&(e.textContent=a.text),a.attachments&&a.attachments.length>0&&(e.attachment=a.attachments.map(a=>({name:a.filename,content:Buffer.isBuffer(a.content)?a.content.toString("base64"):Buffer.from(a.content).toString("base64")})));let f=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{accept:"application/json","api-key":b,"content-type":"application/json"},body:JSON.stringify(e)});if(!f.ok){let a=await f.text();throw console.error(`[Email] Brevo API error: ${f.status} - ${a}`),Error(`Brevo API error: ${f.status} - ${a}`)}let g=await f.json();console.log(`[Email] ✅ SUCCESS - Sent via Brevo API to ${a.to} (Message ID: ${g.messageId||"N/A"})`)}async function h(a){console.log(`[Email] Attempting to send via SMTP to ${a.to}`),console.log(`[Email] SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}, User: ${process.env.SMTP_USER}`);let b=function(){let a={host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD||process.env.SMTP_PASS},connectionTimeout:5e3,greetingTimeout:5e3,socketTimeout:1e4};return d.createTransport(a)}(),c={from:`"${process.env.SMTP_FROM_NAME||"Astralis"}" <${process.env.SMTP_FROM_EMAIL||"support@astralisone.com"}>`,to:a.to,subject:a.subject,text:a.text,html:a.html,attachments:a.attachments},e=await b.sendMail(c);console.log(`[Email] ✅ SUCCESS - Sent via SMTP to ${a.to} (Message ID: ${e.messageId})`)}async function i(a){if(console.log("[Email] ========== EMAIL SEND START =========="),console.log(`[Email] To: ${a.to}`),console.log(`[Email] Subject: ${a.subject}`),process.env.BREVO_API_KEY){console.log("[Email] Brevo API key found, attempting Brevo API send...");try{await g(a),console.log("[Email] ========== EMAIL SEND COMPLETE (BREVO) ==========");return}catch(a){console.error("[Email] ❌ FAILED - Brevo API send failed, attempting SMTP fallback..."),console.error("[Email] Brevo error details:",a instanceof Error?a.message:String(a))}}else console.log("[Email] No Brevo API key found, using SMTP directly");try{await h(a),console.log("[Email] ========== EMAIL SEND COMPLETE (SMTP) ==========")}catch(a){throw console.error("[Email] ❌ FAILED - SMTP send failed"),console.error("[Email] SMTP error details:",a instanceof Error?a.message:String(a)),console.log("[Email] ========== EMAIL SEND FAILED =========="),a}}function j({preheader:a="",heroTitle:b,heroSubtitle:c,introHtml:d,bodyHtml:e,cta:f,footerNote:g}){let h=f?`<tr>
        <td align="center" style="padding: 32px 0 8px;">
          <a href="${f.url}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; padding: 14px 28px; font-weight: 600; border-radius: 9999px; background: linear-gradient(135deg, #2B6CB0 0%, #2b8fdc 100%); color: #ffffff; text-decoration: none;">
            ${f.label}
          </a>
        </td>
      </tr>`:"",i=g?`<tr>
        <td style="padding: 24px 0 0; font-size: 12px; line-height: 1.6; color: #94a3b8; text-align: center;">
          ${g}
        </td>
      </tr>`:"";return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${b}</title>
  <style>
    @media (max-width: 600px) {
      .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#0a1829; font-family:'Inter', Arial, sans-serif;">
  <span style="display:none; color:transparent; visibility:hidden; opacity:0; height:0; width:0;">${a}</span>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" class="container" role="presentation" style="width:640px; max-width:640px; background-color:#ffffff; border-radius:28px; overflow:hidden; box-shadow:0 30px 90px rgba(3,15,35,0.35);">
          <tr>
            <td style="background: radial-gradient(circle at top, rgba(43,108,176,0.65), rgba(10,27,43,0.95)); padding: 40px 32px; text-align:center;">
              <div style="display:inline-flex; align-items:center; gap:12px; padding:6px 16px; border-radius:9999px; background: rgba(255,255,255,0.12); color:#ffffff; font-size:12px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase;">
                Astralis One
              </div>
              <h1 style="margin:24px 0 12px; font-size:32px; line-height:1.25; color:#ffffff;">${b}</h1>
              ${c?`<p style="margin:0; font-size:16px; color:#dbeafe; line-height:1.7;">${c}</p>`:""}
            </td>
          </tr>
          <tr>
            <td class="content" style="padding:32px 40px 40px; background-color:#ffffff;">
              ${d?`<div style="font-size:16px; color:#334155; line-height:1.7; margin-bottom:24px;">${d}</div>`:""}
              <div style="font-size:15px; color:#1e293b; line-height:1.75;">${e}</div>
            </td>
          </tr>
          ${h}
          <tr>
            <td style="padding: 16px 40px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:13px; color:#475569; line-height:1.6; text-align:center;">
                Astralis Operations Platform<br/>
                <a href="mailto:support@astralisone.com" style="color:#2B6CB0; text-decoration:none;">support@astralisone.com</a> \xb7
                <a href="tel:+13412234433" style="color:#2B6CB0; text-decoration:none;">+1 (341) 223-4433</a>
              </p>
            </td>
          </tr>
          ${i}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`}function k(a){let b={VIDEO_CALL:"Video Call",PHONE_CALL:"Phone Call",IN_PERSON:"In-Person Meeting"}[a.meetingType]||a.meetingType,c=`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#f8fafc; border-radius:16px;">
      <tbody>
        <tr>
          <td style="padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Booking ID</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${a.bookingId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Date</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${a.date}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${a.time}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Meeting type</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${b}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`,d=`
    <div style="padding: 18px 24px; border-radius: 16px; background-color: #eff6ff;">
      <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:#0f172a;">Before we meet</p>
      <ul style="margin:0; padding:0 0 0 18px; color:#1e293b; font-size:14px; line-height:1.8;">
        <li>Review the attached calendar invite and add it to your schedule.</li>
        ${"VIDEO_CALL"===a.meetingType?"<li>We'll email a secure video link 1 hour before the session.</li>":""}
        ${"PHONE_CALL"===a.meetingType?`<li>We&#39;ll call you at <strong>${a.phone}</strong> at the scheduled time.</li>`:""}
        <li>Bring any questions or workflows you want us to examine.</li>
      </ul>
    </div>`,e=`
    <div style="margin-top:28px; padding: 18px 24px; border-radius: 16px; background-color:#fef9c3; border:1px solid #fde68a; color:#854d0e; font-size:13px; line-height:1.7;">
      <strong>Need to make a change?</strong><br/>
      Reply to this email, or contact <a href="mailto:support@astralisone.com" style="color:#b45309; text-decoration:none;">support@astralisone.com</a> \xb7
      <a href="tel:+13412234433" style="color:#b45309; text-decoration:none;">+1 (341) 223-4433</a>
    </div>`,f=`Hi <strong>${a.name}</strong>,<br/><br/>Thanks for scheduling time with Astralis. We&apos;re ready to dive into your automation roadmap and identify the fastest wins for your team.`,g=`${c}${d}${e}`;return j({preheader:"Your Astralis consultation is confirmed.",heroTitle:"Your consultation is booked",heroSubtitle:`${a.date} \xb7 ${a.time} (${b})`,introHtml:f,bodyHtml:g,footerNote:"You are receiving this email because you requested a consultation with Astralis. If this wasn’t you, please ignore this message or contact support."})}function l(a){let b={VIDEO_CALL:"Video Call",PHONE_CALL:"Phone Call",IN_PERSON:"In-Person Meeting"}[a.meetingType]||a.meetingType,c=["ASTRALIS CONSULTATION CONFIRMED","",`Hi ${a.name},`,"",`Your consultation is scheduled for ${a.date} at ${a.time} (${b}).`,"",`Booking ID: ${a.bookingId}`,"","NEXT STEPS","- Calendar invite attached for quick add to your schedule"];return"VIDEO_CALL"===a.meetingType&&c.push("- A secure video link will arrive 1 hour before we meet"),"PHONE_CALL"===a.meetingType&&c.push(`- We will call you at ${a.phone} at the scheduled time`),c.push("- Bring any workflows or questions you would like to review together"),c.push("","NEED TO RESCHEDULE?","Email support@astralisone.com or call +1 (341) 223-4433.","","Looking forward to collaborating,","The Astralis Team"),c.join("\n")}function m(a,b){let c={VIDEO_CALL:"Video Call",PHONE_CALL:"Phone Call",IN_PERSON:"In-Person Meeting"}[a.meetingType]||a.meetingType,d=a.startTime.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",timeZone:a.timezone}),e=a.startTime.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:a.timezone}),f=a.endTime.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:a.timezone}),g=b?a.hostName:a.guestName,h=b?a.guestName:a.hostName,i=b?`Hi <strong>${g}</strong>,<br/><br/>Your meeting with ${h} is confirmed. Everything is set for ${d}.`:`Hi <strong>${g}</strong>,<br/><br/>Your meeting with ${h} is booked. We&apos;ll be ready for you on ${d}.`,k=`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#f8fafc; border-radius:16px;">
      <tbody>
        <tr>
          <td style="padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Title</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${a.title}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Date</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${d}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${e} – ${f}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Timezone</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${a.timezone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Meeting type</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${c}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`,l=`
    <div style="padding: 18px 22px; border-radius: 16px; background-color:#eef2ff; display:flex; justify-content:space-between; font-size:13px; color:#312e81;">
      <span style="font-weight:600;">${b?"Guest":"Host"}</span>
      <span style="font-weight:600;">${h} \xb7 ${b?a.guestEmail:a.hostEmail}</span>
    </div>`,m=`
    <div style="margin-top:28px; padding: 18px 24px; border-radius: 16px; background-color:#f1f5f9; font-size:13px; color:#475569; line-height:1.7;">
      Need to adjust anything? Reply to this email or contact <a href="mailto:support@astralisone.com" style="color:#2B6CB0; text-decoration:none;">support@astralisone.com</a>.
    </div>`,n=`${k}${l}${m}`;return j({preheader:`Meeting confirmed with ${h} on ${d}.`,heroTitle:`Meeting confirmed with ${h}`,heroSubtitle:`${d} \xb7 ${e} ${a.timezone}`,introHtml:i,bodyHtml:n,footerNote:"This scheduling update was generated by Astralis. If something looks off, please contact the meeting organizer."})}function n(a,b){let c={VIDEO_CALL:"Video Call",PHONE_CALL:"Phone Call",IN_PERSON:"In-Person Meeting"}[a.meetingType]||a.meetingType,d=a.startTime.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",timeZone:a.timezone}),e=a.startTime.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:a.timezone}),f=a.endTime.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:a.timezone}),g=b?a.hostName:a.guestName,h=b?a.guestName:a.hostName;return`ASTRALIS MEETING CONFIRMED

Hi ${g},

Your meeting with ${h} is scheduled for ${d} from ${e} to ${f} (${a.timezone}).

Title: ${a.title}
Meeting type: ${c}
${b?"Guest":"Host"}: ${h} \xb7 ${b?a.guestEmail:a.hostEmail}

Need to adjust anything? Reply to this email or contact support@astralisone.com.

The Astralis Team`}function o(a){let b={VIDEO_CALL:"Video Call",PHONE_CALL:"Phone Call",IN_PERSON:"In-Person Meeting"}[a.meetingType]||a.meetingType,c=a.startTime.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",timeZone:a.timezone}),d=a.startTime.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:a.timezone}),e=a.endTime.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:a.timezone});return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">New Booking Received</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 14px;">Event ID: ${a.eventId}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 20px;">Guest Information</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 40%;">Name:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${a.guestName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="mailto:${a.guestEmail}" style="color: #3b82f6; text-decoration: none;">${a.guestEmail}</a>
                        </td>
                      </tr>
                      ${a.guestPhone?`
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="tel:${a.guestPhone}" style="color: #3b82f6; text-decoration: none;">${a.guestPhone}</a>
                        </td>
                      </tr>
                      `:""}
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 20px; color: #0A1B2B; font-size: 20px;">Meeting Details</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600; width: 40%;">Title:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${a.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${c}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${d} - ${e}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Timezone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${a.timezone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${b}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is an automated notification from the Astralis booking system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `}async function p(a){try{let b=function(a){let{inviteeEmail:b,inviterName:c,organizationName:d,role:e,inviteToken:f}=a,g=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3001/api",h=`${g}/auth/accept-invite?token=${f}`;return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${d}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1B2B 0%, #1a3a52 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">You've been invited to join a team!</p>
            </td>
          </tr>

          <!-- Envelope Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #2B6CB0; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px;">&#9993;</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Hello!</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                <strong style="color: #0A1B2B;">${c}</strong> has invited you to join
                <strong style="color: #0A1B2B;">${d}</strong> on Astralis.
              </p>

              <!-- Invitation Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Invitation Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Organization:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${d}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Your Role:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${({ADMIN:"Administrator",OPERATOR:"Operator",CLIENT:"Client"})[e]||e}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Invited By:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${c}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Accept Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${h}" style="display: inline-block; background: linear-gradient(135deg, #2B6CB0 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin: 20px 0; color: #64748b; font-size: 13px; text-align: center; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${h}" style="color: #2B6CB0; word-break: break-all;">${h}</a>
              </p>

              <!-- Expiration notice -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Note:</strong> This invitation will expire in 7 days. If you don't recognize this invitation or didn't expect it, you can safely ignore this email.
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                We're excited to have you join the team!
              </p>
              <p style="margin: 10px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                <strong>ASTRALIS</strong>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                <a href="mailto:support@astralisone.com" style="color: #3b82f6; text-decoration: none;">support@astralisone.com</a> |
                <a href="tel:+13412234433" style="color: #3b82f6; text-decoration: none;">+1 (341) 223-4433</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 11px;">
                You're receiving this email because ${c} invited ${b} to join ${d}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `}(a),c=function(a){let{inviteeEmail:b,inviterName:c,organizationName:d,role:e,inviteToken:f}=a,g=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3001/api",h=`${g}/auth/accept-invite?token=${f}`;return`
ASTRALIS - You've been invited to join a team!

Hello!

${c} has invited you to join ${d} on Astralis.

INVITATION DETAILS
------------------
Organization: ${d}
Your Role: ${({ADMIN:"Administrator",OPERATOR:"Operator",CLIENT:"Client"})[e]||e}
Invited By: ${c}

ACCEPT YOUR INVITATION
----------------------
Click the link below or copy and paste it into your browser:
${h}

IMPORTANT
---------
This invitation will expire in 7 days. If you don't recognize this invitation or didn't expect it, you can safely ignore this email.

We're excited to have you join the team!

Best regards,
The Astralis Team

---
ASTRALIS
support@astralisone.com | +1 (341) 223-4433

You're receiving this email because ${c} invited ${b} to join ${d}.
  `.trim()}(a);return await i({to:a.inviteeEmail,subject:`You've been invited to join ${a.organizationName} on Astralis`,html:b,text:c}),console.log(`[Email] Team invite sent successfully to ${a.inviteeEmail}`),!0}catch(b){return console.error(`[Email] Failed to send team invite to ${a.inviteeEmail}:`,b),!1}}function q(){return f().randomBytes(32).toString("hex")}function r(a){let b={VIDEO_CALL:"Video Call",PHONE_CALL:"Phone Call",IN_PERSON:"In-Person Meeting"}[a.meetingType]||a.meetingType;return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">🔔 New Consultation Booking</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 14px;">Booking ID: ${a.bookingId}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 20px;">Client Information</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 40%;">Name:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${a.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="mailto:${a.email}" style="color: #3b82f6; text-decoration: none;">${a.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="tel:${a.phone}" style="color: #3b82f6; text-decoration: none;">${a.phone}</a>
                        </td>
                      </tr>
                      ${a.company?`
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Company:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${a.company}</td>
                      </tr>
                      `:""}
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 20px; color: #0A1B2B; font-size: 20px;">Meeting Details</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600; width: 40%;">Date:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${a.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${a.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Duration:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">30 minutes</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${b}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${a.message?`
              <h2 style="margin: 30px 0 15px; color: #0A1B2B; font-size: 20px;">Discussion Topics</h2>
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${a.message}</p>
              </div>
              `:""}

              <!-- Action Items -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h3 style="margin: 0 0 10px; color: #166534; font-size: 16px;">Action Required</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                  <li>Add this consultation to your calendar (ICS file attached)</li>
                  <li>Review client information and discussion topics</li>
                  ${"VIDEO_CALL"===a.meetingType?"<li>Prepare video call link and send 1 hour before meeting</li>":""}
                  ${"PHONE_CALL"===a.meetingType?"<li>Ensure you have the client's phone number ready</li>":""}
                  <li>Prepare any relevant materials or questions</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is an automated notification from the Astralis booking system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `}}};