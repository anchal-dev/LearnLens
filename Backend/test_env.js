const dotenv = require('dotenv');
dotenv.config();
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value:', process.env.JWT_SECRET);
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
