const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();

const check = require('../middleware/checkRole&Auth');

const videoController = require('../controller/videoController');
router.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
}
));

router.post('/add', check.checkAuth, check.checkRoleAdmin, videoController.addVideo);
router.delete('/delete/:id', check.checkAuth, check.checkRoleAdmin, videoController.deleteVideo);
router.put('/update/:id', check.checkAuth, check.checkRoleAdmin, videoController.updateVideo);
router.get('/getAll', videoController.getAllVideos);
router.get('/getById/:id', videoController.getById);

module.exports = router;