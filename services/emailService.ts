import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface OrderEmailData {
  recipientEmail: string;
  recipientName: string;
  orderId: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface ShippingUpdateData {
  recipientEmail: string;
  recipientName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
}

interface ContactFormData {
  adminEmail: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

interface EnrollmentEmailData {
  recipientEmail: string;
  recipientName: string;
  courseName: string;
  courseUrl: string;
  enrollmentDate: Date;
}

export class EmailService {
  private fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  private adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping order confirmation email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.recipientEmail,
        subject: `Order Confirmation - ${data.orderId}`,
        html: this.generateOrderConfirmationHTML(data),
      });
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  async sendShippingUpdate(data: ShippingUpdateData): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping shipping update email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.recipientEmail,
        subject: `Your Order Has Shipped - ${data.orderId}`,
        html: this.generateShippingUpdateHTML(data),
      });
    } catch (error) {
      console.error('Error sending shipping update email:', error);
      throw new Error('Failed to send shipping update email');
    }
  }

  async sendContactFormNotification(data: ContactFormData): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping contact form notification');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.adminEmail,
        replyTo: data.senderEmail,
        subject: `Contact Form: ${data.subject}`,
        html: this.generateContactFormHTML(data),
      });
    } catch (error) {
      console.error('Error sending contact form notification:', error);
      throw new Error('Failed to send contact form notification');
    }
  }

  async sendEnrollmentConfirmation(data: EnrollmentEmailData): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping enrollment confirmation email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.recipientEmail,
        subject: `Welcome to ${data.courseName}!`,
        html: this.generateEnrollmentHTML(data),
      });
    } catch (error) {
      console.error('Error sending enrollment confirmation:', error);
      throw new Error('Failed to send enrollment confirmation');
    }
  }

  private generateOrderConfirmationHTML(data: OrderEmailData): string {
    const itemsHTML = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Philly Culture</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Thank you for your order, ${data.recipientName}!</h2>
          <p>Your order has been received and is being processed.</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Order Date:</strong> ${data.orderDate.toLocaleDateString()}</p>
          </div>

          <h3>Order Items</h3>
          <table style="width: 100%; background-color: white; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <table style="width: 100%;">
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">$${data.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax:</td>
                <td style="text-align: right;">$${data.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td style="text-align: right;">$${data.shipping.toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td>Total:</td>
                <td style="text-align: right;">$${data.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <h3>Shipping Address</h3>
          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;">${data.shippingAddress.fullName}</p>
            <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
            <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
          </div>

          <p style="margin-top: 30px;">We'll send you a shipping confirmation email with tracking information once your order ships.</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.9em; color: #666;">
          <p>Thank you for shopping with Philly Culture!</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateShippingUpdateHTML(data: ShippingUpdateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Philly Culture</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Your Order Has Shipped!</h2>
          <p>Hi ${data.recipientName},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Carrier:</strong> ${data.carrier}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
          </div>

          <p>You can track your shipment using the tracking number above.</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.9em; color: #666;">
          <p>Thank you for shopping with Philly Culture!</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateContactFormHTML(data: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Contact Form Submission</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>New Contact Form Message</h2>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>From:</strong> ${data.senderName} (${data.senderEmail})</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
          </div>

          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <h3>Message:</h3>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateEnrollmentHTML(data: EnrollmentEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Philly Culture Academy</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Welcome to ${data.courseName}!</h2>
          <p>Hi ${data.recipientName},</p>
          <p>Congratulations! You've been enrolled in <strong>${data.courseName}</strong>.</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Enrollment Date:</strong> ${data.enrollmentDate.toLocaleDateString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.courseUrl}" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Learning
            </a>
          </div>

          <p>We're excited to have you! Get started with your course today.</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.9em; color: #666;">
          <p>Happy learning!</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // LIVE SESSION EMAILS
  // ============================================================

  async sendSessionBookingRequest(data: {
    adminEmail: string;
    adminName: string;
    studentName: string;
    studentEmail: string;
    programTitle: string;
    requestedDateTime: Date;
    sessionDuration: number;
    studentNotes?: string;
    dashboardUrl: string;
  }): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping session booking request email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.adminEmail,
        subject: `New Session Booking Request from ${data.studentName}`,
        html: this.generateSessionBookingRequestHTML(data),
      });
    } catch (error) {
      console.error('Error sending session booking request email:', error);
      throw new Error('Failed to send session booking request email');
    }
  }

  async sendSessionApproval(data: {
    studentEmail: string;
    studentName: string;
    programTitle: string;
    sessionDateTime: Date;
    sessionDuration: number;
    meetingLink: string;
    calendarIcsUrl?: string;
    adminNotes?: string;
  }): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping session approval email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.studentEmail,
        subject: `Your Session is Confirmed - ${data.programTitle}`,
        html: this.generateSessionApprovalHTML(data),
      });
    } catch (error) {
      console.error('Error sending session approval email:', error);
      throw new Error('Failed to send session approval email');
    }
  }

  async sendSessionRejection(data: {
    studentEmail: string;
    studentName: string;
    programTitle: string;
    requestedDateTime: Date;
    reason?: string;
    alternativeSuggestion?: string;
  }): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping session rejection email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.studentEmail,
        subject: `Session Request Update - ${data.programTitle}`,
        html: this.generateRejectionHTML(data),
      });
    } catch (error) {
      console.error('Error sending session rejection email:', error);
      throw new Error('Failed to send session rejection email');
    }
  }

  async sendSessionReminder(data: {
    recipientEmail: string;
    recipientName: string;
    programTitle: string;
    sessionDateTime: Date;
    sessionDuration: number;
    meetingLink: string;
    hoursUntilSession: number;
  }): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping session reminder email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.recipientEmail,
        subject: `Reminder: Your session starts in ${data.hoursUntilSession} hour${data.hoursUntilSession > 1 ? 's' : ''}`,
        html: this.generateReminderHTML(data),
      });
    } catch (error) {
      console.error('Error sending session reminder email:', error);
      throw new Error('Failed to send session reminder email');
    }
  }

  async sendSessionRecording(data: {
    studentEmail: string;
    studentName: string;
    programTitle: string;
    sessionDate: Date;
    recordingUrl: string;
    recordingTitle?: string;
  }): Promise<void> {
    if (!resend) {
      console.warn('Email service not configured - skipping session recording email');
      return;
    }
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: data.studentEmail,
        subject: `Session Recording Available - ${data.programTitle}`,
        html: this.generateRecordingHTML(data),
      });
    } catch (error) {
      console.error('Error sending session recording email:', error);
      throw new Error('Failed to send session recording email');
    }
  }

  private generateSessionBookingRequestHTML(data: {
    adminName: string;
    studentName: string;
    studentEmail: string;
    programTitle: string;
    requestedDateTime: Date;
    sessionDuration: number;
    studentNotes?: string;
    dashboardUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🔔 New Session Booking Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hi ${data.adminName},</h2>
          <p>You have a new live session booking request!</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Student:</strong> ${data.studentName} (${data.studentEmail})</p>
            <p><strong>Program:</strong> ${data.programTitle}</p>
            <p><strong>Requested Date & Time:</strong> ${data.requestedDateTime.toLocaleString()}</p>
            <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
            ${data.studentNotes ? `<p><strong>Student Notes:</strong><br/>${data.studentNotes}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review & Approve/Reject
            </a>
          </div>

          <p>Please review this request and approve or suggest an alternative time.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateSessionApprovalHTML(data: {
    studentName: string;
    programTitle: string;
    sessionDateTime: Date;
    sessionDuration: number;
    meetingLink: string;
    calendarIcsUrl?: string;
    adminNotes?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">✅ Your Session is Confirmed!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Great news, ${data.studentName}!</h2>
          <p>Your live session has been confirmed.</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Program:</strong> ${data.programTitle}</p>
            <p><strong>Date & Time:</strong> ${data.sessionDateTime.toLocaleString()}</p>
            <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
            ${data.adminNotes ? `<p><strong>Notes:</strong><br/>${data.adminNotes}</p>` : ''}
          </div>

          <div style="background-color: #FEF3C7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0;"><strong>📹 Meeting Link:</strong></p>
            <p style="margin: 5px 0;"><a href="${data.meetingLink}" style="color: #DC2626; word-break: break-all;">${data.meetingLink}</a></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.meetingLink}" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
              Join Session
            </a>
            ${data.calendarIcsUrl ? `<a href="${data.calendarIcsUrl}" style="background-color: #6B7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Add to Calendar
            </a>` : ''}
          </div>

          <p>You'll receive reminders 24 hours and 1 hour before the session starts.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateRejectionHTML(data: {
    studentName: string;
    programTitle: string;
    requestedDateTime: Date;
    reason?: string;
    alternativeSuggestion?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Session Request Update</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hi ${data.studentName},</h2>
          <p>Unfortunately, the requested session time is not available.</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Program:</strong> ${data.programTitle}</p>
            <p><strong>Requested Time:</strong> ${data.requestedDateTime.toLocaleString()}</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            ${data.alternativeSuggestion ? `<p><strong>Alternative Suggestion:</strong><br/>${data.alternativeSuggestion}</p>` : ''}
          </div>

          <p>Please choose another available time slot or contact us via chat for assistance.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateReminderHTML(data: {
    recipientName: string;
    programTitle: string;
    sessionDateTime: Date;
    sessionDuration: number;
    meetingLink: string;
    hoursUntilSession: number;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⏰ Session Reminder</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hi ${data.recipientName},</h2>
          <p>Your live session starts in <strong>${data.hoursUntilSession} hour${data.hoursUntilSession > 1 ? 's' : ''}</strong>!</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Program:</strong> ${data.programTitle}</p>
            <p><strong>Date & Time:</strong> ${data.sessionDateTime.toLocaleString()}</p>
            <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
          </div>

          <div style="background-color: #FEF3C7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0;"><strong>📹 Meeting Link:</strong></p>
            <p style="margin: 5px 0;"><a href="${data.meetingLink}" style="color: #DC2626; word-break: break-all;">${data.meetingLink}</a></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.meetingLink}" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Join Session Now
            </a>
          </div>

          <p>See you soon!</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateRecordingHTML(data: {
    studentName: string;
    programTitle: string;
    sessionDate: Date;
    recordingUrl: string;
    recordingTitle?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #8B5CF6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🎥 Session Recording Available</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hi ${data.studentName},</h2>
          <p>The recording from your recent session is now available!</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Program:</strong> ${data.programTitle}</p>
            <p><strong>Session Date:</strong> ${data.sessionDate.toLocaleDateString()}</p>
            ${data.recordingTitle ? `<p><strong>Recording:</strong> ${data.recordingTitle}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.recordingUrl}" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Watch Recording
            </a>
          </div>

          <p>You can review the session content anytime.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
