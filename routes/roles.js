var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET all roles
router.get('/', async function (req, res, next) {
    try {
        let data = await roleModel.find({ isDeleted: false });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET tất cả users thuộc role (phải đặt TRƯỚC /:id để tránh nhầm)
router.get('/:id/users', async function (req, res, next) {
    try {
        let id = req.params.id;

        // Kiểm tra role có tồn tại không
        let role = await roleModel.findOne({ _id: id, isDeleted: false });
        if (!role) {
            return res.status(404).json({ error: 'Role không tồn tại' });
        }

        // Lấy tất cả users có role này
        let users = await userModel.find({
            role: id,
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name description'
        });

        res.json({
            role: role,
            total: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET role by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOne({ _id: id, isDeleted: false });
        if (!result) {
            return res.status(404).json({ error: 'ID NOT FOUND' });
        }
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// CREATE role
router.post('/', async function (req, res, next) {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Thiếu trường bắt buộc: name' });
        }
        let newRole = new roleModel({ name, description });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE role
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findByIdAndUpdate(
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

// SOFT DELETE role
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
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

module.exports = router;
