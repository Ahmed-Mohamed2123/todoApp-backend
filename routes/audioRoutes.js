const express = require('express');
const fileupload = require('express-fileupload');
const router = express.Router();

const check = require('../middleware/checkRole&Auth');

const audioController = require('../controller/audioController');
router.use(fileupload({
    limits: { fileSize: 10 * 1024 * 1024 },
}));

router.post('/add', check.checkAuth, check.checkRoleAdmin,audioController.addAudio);
router.put('/update/:id', check.checkAuth, check.checkRoleAdmin, audioController.updateAudio);
router.delete('/delete/:id', check.checkAuth, check.checkRoleAdmin, check.checkAuth, check.checkRoleAdmin, audioController.deleteAudio);
router.get('/getAll', audioController.getAllAudios);
router.get('/getById/:id', audioController.getById);

module.exports = router;