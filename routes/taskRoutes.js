const express = require('express');
const multer = require('multer');
const router = express.Router();

const check = require('../middleware/checkRole&Auth');

const taskController = require('../controller/taskController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        // const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, Date.now() + '-' + name);
    }
});

router.post('/add', multer({ storage: storage }).single('image'), check.checkAuth, check.checkRoleAdmin, taskController.addTask);
router.delete('/delete/:id', check.checkAuth, check.checkRoleAdmin, taskController.deleteTask);
router.put('/update/:id', multer({ storage: storage }).single('image'), check.checkAuth, check.checkRoleAdmin, taskController.updateTask);
router.get('/getAll', taskController.getAllTask);
router.get('/getById/:id', taskController.getById);

module.exports = router;
