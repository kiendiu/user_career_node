const {
    addServiceGeneral,
    getServiceGeneral,
    addServiceFrame,
    updateServiceFrame,
    deleteServiceFrame,
    updateServiceGeneral,
    getFramesByUserId,
    getSkillsByUser
} = require("./book.service");

module.exports = {
    getSkillsByUser: (req, res) => {
        const user_id = req.decoded.result.user_id;
        getSkillsByUser(user_id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    addServiceGeneral: (req, res) => {
        const user_id = req.decoded.result.user_id;
        const {skill_id, time_online, price_online, time_offline, price_offline, frames } = req.body;
    
        if (!Array.isArray(frames)) {
            return res.status(400).json({
                success: 0,
                message: "Frames must be an array"
            });
        }
    
        addServiceGeneral(user_id, skill_id, time_online, price_online, time_offline, price_offline, (err, serviceResults) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error adding general service"
                });
            }
    
            const frameInsertPromises = frames.map((frame) => {
                return new Promise((resolve, reject) => {
                    addServiceFrame(user_id, frame.week_day, frame.start_time, frame.end_time, (err, frameResults) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(frameResults);
                    });
                });
            });
    
            Promise.all(frameInsertPromises)
                .then((frameResults) => {
                    return res.status(200).json({
                        success: 1,
                        message: "General service and frames added successfully",
                        serviceData: serviceResults,
                        frameData: frameResults
                    });
                })
                .catch((frameError) => {
                    console.log(frameError);
                    return res.status(500).json({
                        success: 0,
                        message: "Database error adding service frames"
                    });
                });
        });
    },
    updateServiceGeneral: (req, res) => {
        const user_id = req.decoded.result.user_id;
        const { service_id, skill_id, time_online, price_online, time_offline, price_offline, frames } = req.body;
    
        // Check if frames is defined and is an array
        if (!Array.isArray(frames)) {
            return res.status(400).json({
                success: 0,
                message: "Frames must be an array"
            });
        }
    
        updateServiceGeneral(service_id, skill_id, time_online, price_online, time_offline, price_offline, (err, serviceResults) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error updating general service"
                });
            }
    
            getFramesByUserId(user_id, (err, existingFrames) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: 0,
                        message: "Database error retrieving existing frames"
                    });
                }
    
                const existingFrameIds = existingFrames.map(frame => frame.service_frame_id);
                const incomingFrameIds = frames.filter(frame => frame.service_frame_id).map(frame => frame.service_frame_id);
    
                const framesToDelete = existingFrames.filter(frame => !incomingFrameIds.includes(frame.service_frame_id));
    
                const framePromises = frames.map((frame) => {
                    if (!frame.service_frame_id) {
                        return new Promise((resolve, reject) => {
                            addServiceFrame(user_id, frame.week_day, frame.start_time, frame.end_time, (err, frameResults) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(frameResults);
                            });
                        });
                    } else {
                        return new Promise((resolve, reject) => {
                            updateServiceFrame(frame.service_frame_id, frame.week_day, frame.start_time, frame.end_time, (err, frameResults) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(frameResults);
                            });
                        });
                    }
                });
    
                framesToDelete.forEach((frame) => {
                    framePromises.push(new Promise((resolve, reject) => {
                        deleteServiceFrame(frame.service_frame_id, (err, deleteResults) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(deleteResults);
                        });
                    }));
                });
    
                Promise.all(framePromises)
                    .then((frameResults) => {
                        return res.status(200).json({
                            success: 1,
                            message: "Service and frames updated successfully",
                            serviceData: serviceResults,
                            frameData: frameResults
                        });
                    })
                    .catch((frameError) => {
                        console.log(frameError);
                        return res.status(500).json({
                            success: 0,
                            message: "Database error updating service frames"
                        });
                    });
            });
        });
    },
    getServiceGeneral: (req, res) => {
        const user_id = req.decoded.result.user_id;

        getServiceGeneral(user_id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error",
                });
            }

            if (!results || results.length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: [{
                        service_id: null,
                        skill_id: null,
                        name_skill: null,
                        time_online: null,
                        price_online: null,
                        time_offline: null,
                        price_offline: null,
                        frames: []
                    }],
                });
            }

            const serviceData = results.reduce((acc, row) => {
                let service = acc.find(s => s.user_id === row.user_id);

                if (!service) {
                    service = {
                        service_id: row.service_id,
                        skill_id: row.skill_id,
                        name_skill: row.name_skill,
                        time_online: row.time_online,
                        price_online: row.price_online,
                        time_offline: row.time_offline,
                        price_offline: row.price_offline,
                        frames: []
                    };
                    acc.push(service);
                }
                if (row.week_day) {
                    service.frames.push({
                        service_frame_id: row.service_frame_id,
                        week_day: row.week_day,
                        start_time: row.start_time,
                        end_time: row.end_time
                    });
                }

                return acc;
            }, []);

            return res.status(200).json({
                success: 1,
                data: serviceData,
            });
        });
    },
    
    createServiceFrame: (req, res) => {
        const { service_id, week_day, start_time, end_time } = req.body;
        addServiceFrame(service_id, week_day, start_time, end_time, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Service frame added successfully",
                data: results
            });
        });
    },
    modifyServiceFrame: (req, res) => {
        const { service_frame_id, week_day, start_time, end_time } = req.body;
        updateServiceFrame(service_frame_id, week_day, start_time, end_time, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Service frame updated successfully",
                data: results
            });
        });
    },
    removeServiceFrame: (req, res) => {
        const { service_frame_id } = req.params;
        deleteServiceFrame(service_frame_id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Service frame deleted successfully",
                data: results
            });
        });
    },
}