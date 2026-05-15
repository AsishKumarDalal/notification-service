class ProviderService {
  async sendEmail(to, subject, body) {
    console.log(`[EmailService] Sending email to ${to}...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[EmailService] Email sent!`);
    return true;
  }

  async sendSMS(to, body) {
    console.log(`[SMSService] Sending SMS to ${to}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[SMSService] SMS sent!`);
    return true;
  }

  async sendPush(token, body) {
    console.log(`[PushService] Sending Push to ${token}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`[PushService] Push sent!`);
    return true;
  }
}

module.exports = new ProviderService();
