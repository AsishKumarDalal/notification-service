const User = require('./user.model');
const UserPreference = require('./preference.model');
const Notification = require('./notification.model');

User.hasMany(UserPreference, { foreignKey: 'userId' });
UserPreference.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  UserPreference,
  Notification
};
