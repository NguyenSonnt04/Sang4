var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET all users (query theo username includes)
router.get('/', async function (req, res, next) {
    try {
        let usernameQ = req.query.username ? req.query.username : '';

        let data = await userModel.find({
            isDeleted: false,
            username: new RegExp(usernameQ, 'i')
        }).populate({
            path: 'role',
            select: 'name description'
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name description'
        });
        if (!result) {
            return res.status(404).json({ error: 'ID NOT FOUND' });
        }
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// CREATE user
router.post('/', async function (req, res, next) {
    try {
        const { username, password, email, fullName, avatarUrl, status, role, loginCount } = req.body;

        if (!username) return res.status(400).json({ error: 'Thiếu trường bắt buộc: username' });
        if (!password) return res.status(400).json({ error: 'Thiếu trường bắt buộc: password' });
        if (!email)    return res.status(400).json({ error: 'Thiếu trường bắt buộc: email' });

        let newUser = new userModel({
            username, password, email,
            fullName, avatarUrl, status,
            role, loginCount
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE user
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findByIdAndUpdate(
            id, req.body, { new: true }
        );
        if (!result) {
            return res.status(404).json({ error: 'ID NOT FOUND' });
        }
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// SOFT DELETE user
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findById(id);
        if (!result) {
            return res.status(404).json({ error: 'ID NOT FOUND' });
        }
        result.isDeleted = true;
        await result.save();
        res.json({ message: 'Đã xoá thành công', data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// ENABLE user - truyền email + username, nếu đúng → status = true
router.post('/enable', async function (req, res, next) {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({ error: 'Thiếu thông tin: cần có email và username' });
        }

        // Tìm user khớp cả email lẫn username
        let user = await userModel.findOne({
            email: email,
            username: username,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({ error: 'Thông tin email hoặc username không đúng' });
        }

        if (user.status === true) {
            return res.status(400).json({ error: 'Tài khoản đã được kích hoạt trước đó' });
        }

        user.status = true;
        await user.save();

        res.json({ message: 'Kích hoạt tài khoản thành công', data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DISABLE user - truyền email + username, nếu đúng → status = false
router.post('/disable', async function (req, res, next) {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({ error: 'Thiếu thông tin: cần có email và username' });
        }

        let user = await userModel.findOne({
            email: email,
            username: username,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({ error: 'Thông tin email hoặc username không đúng' });
        }

        if (user.status === false) {
            return res.status(400).json({ error: 'Tài khoản đã bị vô hiệu hoá trước đó' });
        }

        user.status = false;
        await user.save();

        res.json({ message: 'Vô hiệu hoá tài khoản thành công', data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

