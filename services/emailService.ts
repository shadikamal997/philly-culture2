import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
}

export const emailService = new EmailService();
