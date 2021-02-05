const Task = require('../models/task');
const fs = require('fs');

async function addTask(req, res, next) {
    try {
        const url = req.protocol + '://' + req.get('host');
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            image: url + '/images' + req.file.filename
        });

        task.save().then(createdAudio => {
            res.status(201).json({
                message: 'Task added successfully',
                task: createdAudio
            });
        }).catch(error => {
            res.status(500).json({
                message: 'Creating a task faield'
            });
        });
    } catch(error) {
        return next(error);
    }
};

async function deleteTask(req, res, next) {
    try {
        await Task.findById(req.params.id)
            .then(async (result) => {
                if (result.image) {
                    let imagePath = req.body.image;
                    fs.unlink('./backend/images/' + result.image.substring(28), (err) =>{
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });
                }
                await Task.deleteOne({_id: result._id})
                    .then(result => {
                        res.status(200).json({
                            message: "Deletion successfull!"
                        });
                    })
                    .catch(error => {
                        res.status(500).json({
                            message: "Fetching Task failed!"
                        });
                    });
            }).catch(err => {
                res.status(500).json({
                    message: 'Fetching Task failed!'
                });
            });
    } catch(error) {
        return next(error);
    }
}

async function updateTask(req, res, next) {
    try {
        let title  = req.body.title;
        let description  = req.body.description;
        const taskImport = await Task.findByIdAndUpdate(req.params.id);
        if (title) {
            taskImport.title = title;
        }
        if (description) {
            taskImport.description = description;
        }
        if (req.file) {
            let imagePath = req.body.image;
            fs.unlink('./backend/images/' + taskImport.image.substring(28), (err) =>{
                if(err) return console.log(err);
                console.log('file deleted successfully');
            });
            const url = req.protocol + '://' + req.get('host');
            imagePath = url + '/images/' + req.file.filename;
            taskImport.image = imagePath;
        }

        await taskImport.save().then(result => {
            res.status(200).json({
                result: result
            });
        }).catch(err => {
            res.status(200).json({
                message: "Couldn't update task!",
                error: err
            });
        });
            
    } catch(error) {
        return next(error);
    }
}

async function getAllTask(req, res, next) {
    try {
        // Pagination
        const pageSize = +req.query.pagesize;
        const currentPage = +req.query.page;
        const videoQuery = Task.find();
        // All Videos
        let fetchedTasks;
        if (pageSize && currentPage) {
            videoQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
        }
        videoQuery
            .then(tasks => {
                fetchedTasks = tasks;
                return Task.count();
            }).then(count => {
                res.status(200).json({
                    message: 'Tasks fetched successfully',
                    tasks: fetchedTasks,
                    maxPosts: count
                });
            }).catch(errro => {
                res.status(500).json({
                    message: 'Fetching Tasks faild!'
                });
            });
    } catch(error) {
        return next(error);
    }
};

async function getById(req, res, next) {
    try {
        await Task.findById(req.params.id)
            .then(task => {
                res.status(200).json({
                    message: 'Task fetched successfully',
                    taskById: task
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: 'Fetching task failed!'
                })
            });
    } catch(error) {
        return next(error);
    }
};

module.exports = {
    addTask,
    deleteTask,
    updateTask,
    getAllTask,
    getById
};
