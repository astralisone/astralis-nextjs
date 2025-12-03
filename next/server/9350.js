exports.id=9350,exports.ids=[9350],exports.modules={56931:()=>{},65585:(a,b,c)=>{"use strict";c.d(b,{BE:()=>i,Er:()=>h,HU:()=>j,Yc:()=>m,w:()=>l});var d=c(84437),e=c(55511),f=c.n(e);let g="aes-256-gcm";async function h(a){if(!a||"string"!=typeof a)throw TypeError("hashPassword: password must be a non-empty string");return d.tW(a,12)}async function i(a,b){return d.UD(a,b)}function j(){return Math.random().toString(36).substring(2)+Date.now().toString(36)}function k(){let a=process.env.N8N_ENCRYPTION_KEY||process.env.NEXTAUTH_SECRET;if(!a)throw Error("Encryption key not found in environment variables");return f().pbkdf2Sync(a,"astralis-salt",1e5,32,"sha256")}function l(a){try{let b=f().randomBytes(16),c=f().randomBytes(64),d=k(),e=f().createCipheriv(g,d,b),h=e.update(a,"utf8","hex");h+=e.final("hex");let i=e.getAuthTag();return c.toString("hex")+":"+b.toString("hex")+":"+i.toString("hex")+":"+h}catch(a){throw console.error("Encryption error:",a),Error("Failed to encrypt data")}}function m(a){try{let b=a.split(":");if(4!==b.length)throw Error("Invalid encrypted data format");Buffer.from(b[0],"hex");let c=Buffer.from(b[1],"hex"),d=Buffer.from(b[2],"hex"),e=b[3],h=k(),i=f().createDecipheriv(g,h,c);i.setAuthTag(d);let j=i.update(e,"hex","utf8");return j+=i.final("utf8")}catch(a){throw console.error("Decryption error:",a),Error("Failed to decrypt data")}}},71003:()=>{},94218:(a,b,c)=>{"use strict";c.d(b,{y:()=>n});var d=c(99750),e=c(65585),f=c(44388);let g="http://localhost:3001/api";async function h(a,b){let c=`${g}/auth/verify-email?token=${b}`,d=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Verify Your Email Address</h2>

        <p>Thank you for signing up for AstralisOps! Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${c}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${c}" style="color: #2B6CB0; word-break: break-all;">${c}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This verification link will expire in 24 hours.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't create an account with AstralisOps, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>\xa9 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `,e=`
    Verify Your Email Address

    Thank you for signing up for AstralisOps!

    Please verify your email address by visiting this link:
    ${c}

    This verification link will expire in 24 hours.

    If you didn't create an account with AstralisOps, you can safely ignore this email.
  `;await (0,f.ZM)({to:a,subject:"Verify Your Email - AstralisOps",html:d,text:e})}async function i(a,b){let c=`${g}/auth/reset-password?token=${b}`,d=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Reset Your Password</h2>

        <p>We received a request to reset your password. Click the button below to set a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${c}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${c}" style="color: #2B6CB0; word-break: break-all;">${c}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This password reset link will expire in 1 hour.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>\xa9 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `,e=`
    Reset Your Password

    We received a request to reset your password.

    Visit this link to set a new password:
    ${c}

    This password reset link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email.
  `;await (0,f.ZM)({to:a,subject:"Reset Your Password - AstralisOps",html:d,text:e})}let j=new Map;function k(a){j.set(a,Date.now())}async function l(a,b,c){let e=[1e3,5e3,3e4],f=null;for(let g=0;g<e.length;g++)try{if(console.log(`[Auth] Sending verification email to ${a}, attempt ${g+1}/${e.length}`),await h(a,b),console.log(`[Auth] Verification email sent successfully on attempt ${g+1}`),c){let b=await d.z.users.findUnique({where:{id:c},select:{orgId:!0}});b?.orgId&&await d.z.activityLog.create({data:{userId:c,orgId:b.orgId,action:"EMAIL_SENT",entity:"USER",entityId:c,metadata:{type:"VERIFICATION_EMAIL",attempts:g+1,email:a}}}).catch(a=>{console.error("[Auth] Failed to log email send activity:",a)})}return{success:!0,attempts:g+1}}catch(a){f=a instanceof Error?a:Error(String(a)),console.error(`[Auth] Email send attempt ${g+1} failed:`,f.message),g<e.length-1&&(console.log(`[Auth] Waiting ${e[g]}ms before retry...`),await new Promise(a=>setTimeout(a,e[g])))}if(console.error(`[Auth] All ${e.length} email attempts failed for ${a}`),c){let b=await d.z.users.findUnique({where:{id:c},select:{orgId:!0}});b?.orgId&&await d.z.activityLog.create({data:{userId:c,orgId:b.orgId,action:"EMAIL_FAILED",entity:"USER",entityId:c,metadata:{type:"VERIFICATION_EMAIL",attempts:e.length,email:a,error:f?.message||"Unknown error"}}}).catch(a=>{console.error("[Auth] Failed to log email failure activity:",a)})}return{success:!1,attempts:e.length,error:f?.message||"Unknown error"}}setInterval(()=>{let a=Date.now(),b=[];j.forEach((c,d)=>{a-c>3e5&&b.push(d)}),b.forEach(a=>j.delete(a))},6e4);class m{async signUp(a){let{email:b,password:c,name:f,orgName:g}=a;if(await d.z.users.findUnique({where:{email:b}}))throw Error("User with this email already exists");let h=await (0,e.Er)(c),i=(0,e.HU)(),j=new Date(Date.now()+864e5),k=await d.z.$transaction(async a=>{let c=await a.organization.create({data:{name:g}}),d=await a.users.create({data:{email:b,password:h,name:f,role:"ADMIN",orgId:c.id}});return await a.verificationToken.create({data:{identifier:b,token:i,expires:j}}),await a.activityLog.create({data:{userId:d.id,orgId:c.id,action:"CREATE",entity:"USER",entityId:d.id,metadata:{email:b,name:f,source:"SIGNUP"}}}),{user:d,org:c,verificationToken:i}}),m=await l(b,i,k.user.id);return m.success?{success:!0,message:"Account created successfully. Please check your email to verify your account.",userId:k.user.id,emailSent:!0}:(console.error("[AuthService.signUp] Failed to send verification email after retries:",m.error),{success:!0,message:'Account created, but we could not send the verification email. Please use the "Resend verification" option to try again.',userId:k.user.id,emailSent:!1})}async verifyEmail(a){let b=await d.z.verificationToken.findUnique({where:{token:a}});if(!b)throw Error("Invalid or expired verification token");if(new Date>b.expires)throw Error("Verification token has expired");let c=await d.z.users.update({where:{email:b.identifier},data:{emailVerified:new Date}});return c.orgId&&await d.z.activityLog.create({data:{userId:c.id,orgId:c.orgId,action:"UPDATE",entity:"USER",entityId:c.id,metadata:{action:"EMAIL_VERIFIED",email:c.email}}}),await d.z.verificationToken.delete({where:{token:a}}),{success:!0,message:"Email verified successfully"}}async resendVerificationEmail(a){let b=function(a){let b=j.get(a),c=Date.now();return b&&c-b<6e4?{allowed:!1,waitSeconds:Math.ceil((6e4-(c-b))/1e3)}:{allowed:!0}}(a);if(!b.allowed)throw Error(`Please wait ${b.waitSeconds} seconds before requesting another email`);let c=await d.z.users.findUnique({where:{email:a},select:{id:!0,emailVerified:!0,orgId:!0}});if(!c)return k(a),{success:!0,message:"If the email exists and is not verified, a verification link has been sent."};if(c.emailVerified)return{success:!1,message:"Email is already verified"};let f=(0,e.HU)(),g=new Date(Date.now()+864e5);await d.z.verificationToken.deleteMany({where:{identifier:a}}),await d.z.verificationToken.create({data:{identifier:a,token:f,expires:g}}),k(a);let h=await l(a,f,c.id);if(c.orgId&&await d.z.activityLog.create({data:{userId:c.id,orgId:c.orgId,action:"UPDATE",entity:"USER",entityId:c.id,metadata:{action:"VERIFICATION_EMAIL_RESENT",email:a,success:h.success,attempts:h.attempts}}}),h.success)return{success:!0,message:"Verification email sent successfully"};throw Error("Failed to send verification email. Please try again later.")}async requestPasswordReset(a){if(!await d.z.users.findUnique({where:{email:a}}))return{success:!0,message:"If an account exists, a password reset link has been sent."};let b=(0,e.HU)(),c=new Date(Date.now()+36e5);return await d.z.verificationToken.create({data:{identifier:a,token:b,expires:c}}),await i(a,b),{success:!0,message:"If an account exists, a password reset link has been sent."}}async resetPassword(a,b){let c=await d.z.verificationToken.findUnique({where:{token:a}});if(!c)throw Error("Invalid or expired reset token");if(new Date>c.expires)throw Error("Reset token has expired");let f=await (0,e.Er)(b);return await d.z.users.update({where:{email:c.identifier},data:{password:f}}),await d.z.verificationToken.delete({where:{token:a}}),{success:!0,message:"Password reset successfully"}}}let n=new m},99750:(a,b,c)=>{"use strict";c.d(b,{z:()=>e});var d=c(96330);let e=globalThis.prisma??new d.PrismaClient({log:["error","warn"]})}};