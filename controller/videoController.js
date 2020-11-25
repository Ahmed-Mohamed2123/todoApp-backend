const Video = require('../models/video');
const fileUploadService =  require('../aws/upload.service');

async function addVideo(req, res, next) {
    try{
        if(req.files) {
            let uploadRes;
            if (req.files.image) {
                const file = req.files.image;
                uploadRes = await(await fileUploadService.uploadFileToAws(file, 'videos')).fileUrl;
            }
            
            const file1 = req.files.video;
            const uploadRes1 = await fileUploadService.uploadFileToAws(file1, 'videos');

            const video = await new Video({
                title: req.body.title,
                description: req.body.description,
                image: uploadRes,
                video: uploadRes1.fileUrl
            });

            await video.save().then(video => {
                res.status(201).json({ 
                    message: 'Video created successfully', 
                    data: video 
                });
            }).catch(error => {
                res.status(500).json({
                    message: "Creating a video faield!",
                    error
                })
            });
            
        } else {
            const errMsg= {
                message: 'FILES_NOT_FOUND',
                messageCode: 'FILES_NOT_FOUND',
                statusCode: 404,
            }
            return res.status(404).send(errMsg);
        }
    } catch(error){
        return next(error);
    }
}

async function deleteVideo(req, res, next) {
    try {
        await Video.findById(req.params.id)
            .then(async (result) => {
                if (result.image) {
                    await fileUploadService.deleteFileToAws(result.image);
                }
                if (result.video) {
                    await fileUploadService.deleteFileToAws(result.video);
                }
                await Video.deleteOne({_id: result._id})
                    .then(result => {
                        res.status(200).json({ 
                            message: "Deletion successfull!"
                        });
                    })
                    .catch(error => {
                        res.status(500).json({
                            message: "Fetching Video failed!"
                        });
                    });
            }).catch(err => {
                res.status(500).json({
                    message: 'Fetching video failed!'
                });
            });
    } catch(error) {
        return next(error);
    }
}

async function updateVideo(req, res, next) {
    try {
        let title  = req.body.title;
        let description  = req.body.description;
        const videoImport = await Video.findByIdAndUpdate(req.params.id);
        if (title) {
            videoImport.title = title;
        }
        if (description) {
            videoImport.description = description;
        }
        if (req.files) {
            if (req.files.image) {
                if (videoImport.image) {
                    console.log('1');
                    await fileUploadService.deleteFileToAws(videoImport.image);
                    let image = req.files.image;
                    let file1 = await (await fileUploadService.uploadFileToAws(image, 'videos')).fileUrl;
    
                    videoImport.image = file1;
                }
            }

            if (req.files.video) {
                if (videoImport.video) {
                    console.log('2');
                    await fileUploadService.deleteFileToAws(videoImport.video);
                    let video = req.files.video;
                    let file = await (await fileUploadService.uploadFileToAws(video, 'videos')).fileUrl;
    
                    videoImport.video = file;
                }
            }
        }

        await videoImport.save().then(result => {
            res.status(200).json({
                result: result
            });
        }).catch(err => {
            res.status(200).json({
                message: "Couldn't update video!",
                error: err
            });
        });
            
    } catch(error) {
        return next(error);
    }
}

async function getAllVideos(req, res, next) {
    try {
        // Pagination
        const pageSize = +req.query.pagesize;
        const currentPage = +req.query.page;
        const videoQuery = Video.find();
        // All Videos
        let fetchedVideos;
        if (pageSize && currentPage) {
            videoQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
        }
        videoQuery
            .then(videos => {
                fetchedVideos = videos;
                return Video.count();
            }).then(count => {
                res.status(200).json({
                    message: 'Videos fetched successfully',
                    videos: fetchedVideos,
                    maxPosts: count
                });
            }).catch(errro => {
                res.status(500).json({
                    message: 'Fetching videos faild!'
                });
            });
    } catch(error) {
        return next(error);
    }
};

async function getById(req, res, next) {
    try {
        await Video.findById(req.params.id)
            .then(video => {
                res.status(200).json({
                    message: 'video fetched successfully',
                    videoById: video
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: 'Fetching video failed!'
                })
            });
    } catch(error) {
        return next(error);
    }
};

module.exports = {
    addVideo,
    deleteVideo,
    updateVideo,
    getAllVideos,
    getById
};