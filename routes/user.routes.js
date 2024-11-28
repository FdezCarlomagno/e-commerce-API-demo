const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');


//Public routes
router.post('/token', userController.getToken);
router.post('/register', userController.createUser);


//Protected routes

router.get('/profile', isAuthenticated, userController.getProfile);
router.put('/profile', isAuthenticated, userController.updateProfile);
router.delete('/profile', isAuthenticated, userController.deleteAccount);


//Admin routes
router.get('/', isAuthenticated, isAdmin, userController.getUsers);
router.put('/promote/:userId', isAuthenticated, isAdmin, userController.promoteToAdmin);
router.get('/:userId', isAuthenticated, isAdmin, userController.getUser);

module.exports = router;