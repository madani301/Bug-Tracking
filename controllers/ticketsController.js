const User = require('../models/User');
const Tickets = require('../models/Tickets');
const Comments = require('../models/Comments');
const mongo_sanitize = require('mongo-sanitize');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const DOMPurify = createDomPurify(new JSDOM().window);

exports.landing_page = async (req, res) => {
    try {
        const tickets = await Tickets.find({}).lean();
        const users = await User.find({}, { name: 1, _id: 1, role: 1, group: 1 }).lean();
        res.render('main', {
            user: req.user,
            tickets, users
        })
    } catch (err) {
        console.error(err);
        res.render('../views/errors/400.ejs');
    }
}

exports.development_dashboard = async (req, res) => {
    try {
        const tickets = await Tickets.find({ "ticket_type": "Development" }).lean();
        const users = await User.find({}, { name: 1, _id: 1, role: 1, group: 1 }).lean();
        res.render('main', {
            user: req.user,
            tickets, users
        })
    } catch (err) {
        console.error(err);
        res.render('../views/errors/400.ejs');
    }
}

exports.testing_dashboard = async (req, res) => {
    try {
        const tickets = await Tickets.find({ "ticket_type": "Testing" }).lean();
        const users = await User.find({}, { name: 1, _id: 1, role: 1, group: 1 }).lean();
        res.render('main', {
            user: req.user,
            tickets, users
        })
    } catch (err) {
        console.error(err);
        res.render('../views/errors/400.ejs');
    }
}

exports.production_dashboard = async (req, res) => {
    try {
        const tickets = await Tickets.find({ "ticket_type": "Production" }).lean();
        const users = await User.find({}, { name: 1, _id: 1, role: 1, group: 1 }).lean();
        res.render('main', {
            user: req.user,
            tickets, users
        })
    } catch (err) {
        console.error(err);
        res.render('../views/errors/400.ejs');
    }
}

exports.add_ticket = function (req, res) {
    const user = User.schema.path('group').enumValues;
    res.render("main", {
        user: req.user,
        user
    });
};

exports.post_ticket = async (req, res) => {
    var query = {
        ticket_name: mongo_sanitize((req.body.ticket_name)),
        ticket_details: mongo_sanitize(req.body.ticket_details),
        ticket_status: mongo_sanitize(req.body.ticket_status),
        ticket_priority: mongo_sanitize(req.body.ticket_priority),
        ticket_type: mongo_sanitize(req.body.ticket_type),
        assign_to: mongo_sanitize(req.body.assign_to),
        ticket_no: mongo_sanitize(req.body.ticket_no),
        created_by: mongo_sanitize(req.body.created_by),
        user: mongo_sanitize(req.user._id)
    }

    try {
        await Tickets.create(query);
        res.redirect('/dashboard');
    } catch (err) {
        res.render('../views/errors/400.ejs');
    }
}


exports.edit_ticket = async (req, res) => {
    const users = await User.find({}, { name: 1, _id: 1, role: 1, group: 1 }).lean();
    var id = mongo_sanitize(req.params.id)
    const tickets = await Tickets.findOne({
        _id: id
    }).lean();

    req.query = { _id: { $ne: 1 } }
    console.log("\nNOT SANITIZED: ", req.query, "\n");
    console.log("\nSANITIZED: ", mongo_sanitize(req.query), "\n")

    const comments = await Comments.find({ ticket_id: id }).lean().populate('ticket_id');
    if (!tickets) {
        console.log("ERROR")
    } else {
        res.render('edit', {
            user: req.user,
            ticket: req.params.id,
            tickets, users, comments
        });
    }
}

exports.update_ticket = async (req, res) => {
    try {
        var id = mongo_sanitize(req.params.id)
        var t_body = mongo_sanitize(req.body)
        tickets = await Tickets.findOneAndUpdate({ _id: id }, t_body, {
            new: true
        });
        res.redirect('/dashboard');
    } catch (err) {
        return res.render('../views/errors/400.ejs');
    }

}

exports.delete_ticket = async (req, res) => {
    var id = mongo_sanitize(req.params.id)
    try {
        await Tickets.deleteOne({ _id: id });
        await Comments.deleteMany({ ticket_id: id });
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        return res.render('../views/errors/400.ejs');
    }
}


exports.post_comment = async (req, res) => {
    var c_body = mongo_sanitize(req.body)
    try {
        await Comments.create(c_body);
        res.redirect('back');
    } catch (err) {
        res.render('../views/errors/400.ejs');
    }
}