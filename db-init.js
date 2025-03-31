// Database initialization script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const StellarSdk = require('stellar-sdk');

// MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/stellarid';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected successfully');
  
  // Define User schema
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ['user', 'attester', 'verifier', 'admin'],
      default: 'user'
    },
    stellarPublicKey: {
      type: String,
      required: false
    },
    stellarSecretKey: {
      type: String,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date
    }
  });

  // Hash password before saving
  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  const User = mongoose.model('User', userSchema);
  
  try {
    // Check if admin user exists
    let admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Creating admin user...');
      
      // Generate Stellar keypair for admin
      const keypair = StellarSdk.Keypair.random();
      
      // Create admin user
      admin = new User({
        username: 'admin',
        email: 'admin@stellarid.example.com',
        password: 'admin123',
        role: 'admin',
        stellarPublicKey: keypair.publicKey(),
        stellarSecretKey: keypair.secret(),
        isActive: true
      });
      
      await admin.save();
      console.log('Admin user created:', admin.username);
    } else {
      console.log('Admin user already exists');
    }
    
    // Create attester user
    let attester = await User.findOne({ username: 'attester' });
    
    if (!attester) {
      console.log('Creating attester user...');
      
      // Generate Stellar keypair for attester
      const keypair = StellarSdk.Keypair.random();
      
      // Create attester user
      attester = new User({
        username: 'attester',
        email: 'attester@stellarid.example.com',
        password: 'attester123',
        role: 'attester',
        stellarPublicKey: keypair.publicKey(),
        stellarSecretKey: keypair.secret(),
        isActive: true
      });
      
      await attester.save();
      console.log('Attester user created:', attester.username);
    } else {
      console.log('Attester user already exists');
    }

    // Create verifier user
    let verifier = await User.findOne({ username: 'verifier' });
    
    if (!verifier) {
      console.log('Creating verifier user...');
      
      // Generate Stellar keypair for verifier
      const keypair = StellarSdk.Keypair.random();
      
      // Create verifier user
      verifier = new User({
        username: 'verifier',
        email: 'verifier@stellarid.example.com',
        password: 'verifier123',
        role: 'verifier',
        stellarPublicKey: keypair.publicKey(),
        stellarSecretKey: keypair.secret(),
        isActive: true
      });
      
      await verifier.save();
      console.log('Verifier user created:', verifier.username);
    } else {
      console.log('Verifier user already exists');
    }
    
    console.log('Database initialization complete!');
    console.log('-----------------------------------');
    console.log('You can now use these credentials to log in:');
    console.log('Admin: username="admin", password="admin123"');
    console.log('Attester: username="attester", password="attester123"');
    console.log('Verifier: username="verifier", password="verifier123"');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});