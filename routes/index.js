const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const controller = require('../controllers/ticketsController');


router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
router.get('/dashboard', ensureAuthenticated, controller.landing_page);
router.get('/dashboard/development', ensureAuthenticated, controller.development_dashboard);
router.get('/dashboard/testing', ensureAuthenticated, controller.testing_dashboard);
router.get('/dashboard/production', ensureAuthenticated, controller.production_dashboard);
router.get('/add', ensureAuthenticated, controller.landing_page);
router.post('/add', ensureAuthenticated, controller.post_ticket);
router.get('/edit/:id', ensureAuthenticated, controller.edit_ticket);
router.post('/edit/:id', ensureAuthenticated, controller.update_ticket);
router.get('/delete/ticket/:id', ensureAuthenticated, controller.delete_ticket);
router.post('/add_comments', ensureAuthenticated, controller.post_comment);

module.exports = router;
