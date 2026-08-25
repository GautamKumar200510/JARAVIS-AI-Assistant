import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage, User } from '../storage';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jaravis-cyber-secure-secret-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User session expired or not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Register
router.post('/register', (req, res) => {
  try {
    const { username, email, password, displayName, callsign } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (storage.getUserByEmail(email)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    if (storage.getUserByUsername(username)) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
      displayName: displayName?.trim() || username.trim(),
      callsign: callsign?.trim() || 'Sir',
      themeColor: 'cyan',
      voiceSettings: {
        pitch: 1.0,
        rate: 1.0,
        autoSpeak: true,
        soundEffects: true
      },
      assistantStyle: 'butler',
      createdAt: new Date().toISOString()
    };

    const created = storage.createUser(newUser);
    const token = jwt.sign({ userId: created.id }, JWT_SECRET, { expiresIn: '30d' });

    const { passwordHash: _, ...safeUser } = created;
    return res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const user = storage.getUserByEmail(identifier) || storage.getUserByUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Simple Sign-In with Name and Email ID
router.post('/simple-login', (req, res) => {
  try {
    const { name, email, callsign } = req.body;

    if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ error: 'Full name and valid email address are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanCallsign = (callsign && typeof callsign === 'string' && callsign.trim()) 
      ? callsign.trim() 
      : (cleanName.split(' ')[0] || 'Sir');

    let user = storage.getUserByEmail(cleanEmail);

    if (user) {
      // Update display name if changed
      user = storage.updateUser(user.id, {
        displayName: cleanName,
        callsign: cleanCallsign
      }) || user;
    } else {
      // Create new operative profile
      const passwordHash = bcrypt.hashSync('jaravis_' + Math.random().toString(36), 10);
      const username = cleanEmail.split('@')[0] || ('user_' + Date.now().toString(36));
      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        username,
        email: cleanEmail,
        passwordHash,
        displayName: cleanName,
        callsign: cleanCallsign,
        themeColor: 'cyan',
        voiceSettings: {
          pitch: 1.0,
          rate: 1.0,
          autoSpeak: true,
          soundEffects: true
        },
        assistantStyle: 'butler',
        createdAt: new Date().toISOString()
      };
      user = storage.createUser(newUser);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Sign in failed: ' + err.message });
  }
});

// Demo 1-Click Login (Default Gautam Kumar profile)
router.post('/demo-login', (req, res) => {
  try {
    let demoUser = storage.getUserByEmail('gautamkr.71019@gmail.com') || storage.getUserById('usr_demo_gautam');
    if (!demoUser) {
      const passwordHash = bcrypt.hashSync('jaravis2026', 10);
      demoUser = {
        id: 'usr_demo_gautam',
        username: 'gautam',
        email: 'gautamkr.71019@gmail.com',
        passwordHash,
        displayName: 'Gautam Kumar',
        callsign: 'Gautam',
        themeColor: 'cyan',
        voiceSettings: {
          pitch: 1.0,
          rate: 1.0,
          autoSpeak: true,
          soundEffects: true
        },
        assistantStyle: 'butler',
        createdAt: new Date().toISOString()
      };
      storage.createUser(demoUser);
    }

    const token = jwt.sign({ userId: demoUser.id }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = demoUser;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Demo login failed: ' + err.message });
  }
});

// Get Current User Profile
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { passwordHash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

// Update Profile & Settings
router.put('/update-profile', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { displayName, email, callsign, themeColor, voiceSettings, assistantStyle } = req.body;
  const updates: Partial<User> = {};

  if (displayName) updates.displayName = displayName.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (callsign) updates.callsign = callsign.trim();
  if (themeColor) updates.themeColor = themeColor;
  if (assistantStyle) updates.assistantStyle = assistantStyle;
  if (voiceSettings) {
    updates.voiceSettings = {
      ...req.user.voiceSettings,
      ...voiceSettings
    };
  }

  const updatedUser = storage.updateUser(req.user.id, updates);
  if (!updatedUser) return res.status(404).json({ error: 'User not found' });

  const { passwordHash: _, ...safeUser } = updatedUser;
  return res.json({ user: safeUser });
});

export default router;
