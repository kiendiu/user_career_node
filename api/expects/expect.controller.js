const {
    addExperience,
    updateExperience,
    deleteExperience,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addSkill,
    updateSkill,
    deleteSkill
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
    addSkill: (req, res) => {
        const data = req.body;
        addSkill(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: "Database connection error" });
            }
            return res.status(200).json({ success: 1, data: results });
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
    }
};