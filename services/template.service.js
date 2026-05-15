const Handlebars = require('handlebars');

const templates = {
  'WELCOME': 'Hello {{name}}! Welcome to our platform.',
  'ORDER_CONFIRMED': 'Success! Your order #{{orderId}} for {{item}} has been confirmed.',
  'OTP': 'Your secret code is: {{code}}. Do not share this.'
};

class TemplateService {
  render(type, data, notificationId = null) {
    let source = templates[type] || 'Default Message: {{data}}';
    
    // if we have a notificationId, we can wrap links for tracking
    if (notificationId && data.link) {
      const trackedLink = `http://localhost:3000/v1/notifications/${notificationId}/track?url=${encodeURIComponent(data.link)}`;
      data.link = trackedLink;
    }

    const template = Handlebars.compile(source);
    return template(data);
  }
}

module.exports = new TemplateService();
