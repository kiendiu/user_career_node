// const { get } = require("./expect.router");
const {
    addExperience,
    updateExperience,
    deleteExperience,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addSkillAndService,
    updateSkill,
    deleteSkill,
    getAllCategories,
    getExperiencesByUser,
    getCertificatesByUser,
    getSkillsByUser,
    getDetailsExperienceService,
    getDetailSkillService,
    getDetailCertificateService
} = require("./expect.service");

module.exports = {
    addExperience: (req, res) => {
        const data = req.body;
        addExperience(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    },
    updateExperience: (req, res) => {
        const data = req.body;
        updateExperience(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    },
    deleteExperience: (req, res) => {
        const id = req.params.id;
        deleteExperience(id, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, message: "Experience deleted successfully" });
        });
    },
    addCertificate: (req, res) => {
        const data = req.body;
        addCertificate(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    },
    updateCertificate: (req, res) => {
        const data = req.body;
        updateCertificate(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    },
    deleteCertificate: (req, res) => {
        const id = req.params.id;
        deleteCertificate(id, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, message: "Certificate deleted successfully" });
        });
    },
    addSkillAndService: (req, res) => {
        const body = req.body;
        addSkillAndService(body, (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database connection error" });
            }
            return res.status(200).json({ success: "Skill and service added successfully" });
        });
    },
    updateSkill: (req, res) => {
        const data = req.body;
        updateSkill(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    },
    deleteSkill: (req, res) => {
        const id = req.params.id;
        deleteSkill(id, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, message: "Skill deleted successfully" });
        });
    },
    getListCategories: (req, res) => {
        getAllCategories((err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database connection error" });
            }
            return res.status(200).json(results);
        });
    },

    getSkillsByUser: (req, res) => {
        const userId = req.decoded.result.user_id;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
    
        getSkillsByUser(userId, page, size, (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database connection error" });
            }
            
            const total = results.total;
            const totalPage = Math.ceil(total / size);
    
            return res.status(200).json({
                data: results.data,
                metadata: {
                    total,
                    size,
                    total_page: totalPage,
                    page
                }
            });
        });
    },
    getExperiencesByUser: (req, res) => {
        const userId = req.decoded.result.user_id;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
    
        getExperiencesByUser(userId, page, size, (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database connection error" });
            }
            
            const total = results.total;
            const totalPage = Math.ceil(total / size);
    
            return res.status(200).json({
                data: results.data,
                metadata: {
                    total,
                    size,
                    total_page: totalPage,
                    page
                }
            });
        });
    },
    getCertificatesByUser: (req, res) => {
        const userId = req.decoded.result.user_id;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
    
        getCertificatesByUser(userId, page, size, (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database connection error" });
            }
            
            const total = results.total;
            const totalPage = Math.ceil(total / size);
    
            return res.status(200).json({
                data: results.data,
                metadata: {
                    total,
                    size,
                    total_page: totalPage,
                    page
                }
            });
        });
    },
    getDetailsExperience : (req, res) => {
        const id = req.params.id;
        getDetailsExperienceService(id, (err, results) => {
            if (err) {
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
    getDetailSkill : (req, res) => {
        const id = req.params.id;
        getDetailSkillService(id, (err, results) => {
            if (err) {
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
    getDetailCertificate : (req, res) => {
        const id = req.params.id;
        getDetailCertificateService(id, (err, results) => {
            if (err) {
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
};