const User = require('../models/User');
const Grade = require('../models/Grade');
const jwt = require('jsonwebtoken');

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

const generateToken = (id, role, studentClass) => {
  return jwt.sign(
    { id, role, studentClass },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { name, email, password, role, studentClass } = req.body;
  const normalizedRole = role ? role.toLowerCase() : 'student';

  if (!name || !name.trim() || !email || !email.trim() || !password) {
    return res.status(400).json({ message: 'Please provide all required fields: name, email, password' });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (!['student', 'teacher'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Invalid role. Role must be student or teacher' });
  }

  try {
    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let grade = null;
    if (normalizedRole === 'student' && studentClass) {
      const gradeSlug = slugify(studentClass);
      grade = await Grade.findOne({ slug: gradeSlug });
      if (!grade) {
        return res.status(400).json({ message: 'Please select a valid class from the dropdown.' });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: normalizedRole,
      studentClass: normalizedRole === 'student' && studentClass ? studentClass.trim() : null,
      grade: normalizedRole === 'student' && grade ? grade._id : null
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentClass: user.studentClass,
        grade: grade ? { _id: grade._id, name: grade.name, slug: grade.slug } : null,
        token: generateToken(user._id, user.role, user.studentClass)
      });
    }
  } catch (error) {
    console.error('Registration error in backend:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).populate('grade');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentClass: user.studentClass,
        grade: user.grade ? { _id: user.grade._id, name: user.grade.name, slug: user.grade.slug } : null,
        token: generateToken(user._id, user.role, user.studentClass)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('grade');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentClass: user.studentClass,
      grade: user.grade ? { _id: user.grade._id, name: user.grade.name, slug: user.grade.slug } : null,
      joinedAt: user.joinedAt
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update student class after login
// @route   PUT /api/auth/class
exports.updateStudentClass = async (req, res) => {
  console.log('[updateStudentClass] headers:', req.headers.authorization ? 'AUTH_PRESENT' : 'NO_AUTH');
  console.log('[updateStudentClass] body:', req.body);
  console.log('[updateStudentClass] req.user:', req.user ? req.user._id : 'NO_USER');

  const { studentClass } = req.body;

  if (!studentClass || !studentClass.trim()) {
    return res.status(400).json({ message: 'Please select a valid class.' });
  }

  try {
    const gradeSlug = slugify(studentClass);
    const grade = await Grade.findOne({ slug: gradeSlug });
    if (!grade) {
      return res.status(400).json({ message: 'Selected class is not available.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.studentClass = studentClass.trim();
    user.grade = grade._id;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentClass: user.studentClass,
      grade: { _id: grade._id, name: grade.name, slug: grade.slug },
      token: generateToken(user._id, user.role, user.studentClass)
    });
  } catch (error) {
    console.error('[updateStudentClass] error', error);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};
