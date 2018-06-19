const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

/**
 * Creates a Mongoose schema for a
 * user in the database.
 */
function createUserSchema(options) {
  const schema = new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      required: true,
      default: 'editor'
    },
    email: {
      type: String,
      required: true
    },
    firstName: String,
    lastName: String
  });

  /**
   * Before saving a username, make sure to
   * encrypt the password.
   */
  schema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) {
      return next();
    }

    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      return next();
    });
  });

  /**
   * Provide internal method for checking
   * the password.
   */
  schema.methods.checkPassword = function(passwordAttempt, callback) {
    bcrypt.compare(passwordAttempt, this.password, (err, isMatch) => {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  };

  return mongoose.model('User', schema);
}

/**
 * Export factory function.
 */
module.exports = createUserSchema;