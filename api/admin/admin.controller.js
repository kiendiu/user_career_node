const {
    addCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getCategoriesParent,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    getLanguages,
    getUsers,
    updateUserStatus,
    updateExpertStatus,
} = require("./admin.service");

module.exports = {
    createCategory: (req, res) => {
        const { name_category: name, parent_id: parentId } = req.body;
        addCategory(name, parentId, (error, id) => {
            if (error) {
                return res.status(500).json({ error: "Failed to create category" });
            }
            res.status(201).json({ id });
        });
    },
    modifyCategory: (req, res) => {
        const { id } = req.params;
        const { name_category: name, parent_id: parentId } = req.body;
        updateCategory(id, name, parentId, (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Failed to update category" });
            }
            res.status(204).send();
        });
    },
    removeCategory: (req, res) => {
        const { id } = req.params;
        deleteCategory(id, (error, results) => {
            if (error) {
                if (error.code === 403) {
                    return res.status(403).send();
                }
                return res.status(500).json({ error: "Failed to delete category" });
            }
            res.status(204).send();
        });
    },
    listCategories: (req, res) => {
        getCategories((error, categories) => {
            if (error) {
                return res.status(500).json({ error: "Failed to retrieve categories" });
            }
            res.json(categories);
        });
    },
    listCategoriesParent: (req, res) => {
        getCategoriesParent((error, categories) => {
            if (error) {
                return res.status(500).json({ error: "Failed to retrieve categories" });
            }
            res.json(categories);
        });
    },

    // Language Controller
    createLanguage: (req, res) => {
        const { name_language : name } = req.body;
        addLanguage(name, (error, id) => {
            if (error) {
                return res.status(500).json({ error: "Failed to create language" });
            }
            res.status(201).json({ id });
        });
    },
    modifyLanguage: (req, res) => {
        const { id } = req.params;
        const { name_language : name } = req.body;
        updateLanguage(id, name, (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Failed to update language" });
            }
            res.status(204).send();
        });
    },
    removeLanguage: (req, res) => {
        const { id } = req.params;
        deleteLanguage(id, (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Failed to delete language" });
            }
            res.status(204).send();
        });
    },
    listLanguages: (req, res) => {
        getLanguages((error, languages) => {
            if (error) {
                return res.status(500).json({ error: "Failed to retrieve languages" });
            }
            res.json(languages);
        });
    },

    // User Controller
    listUsers: (req, res) => {
        getUsers((error, users) => {
            if (error) {
                return res.status(500).json({ error: "Failed to retrieve users" });
            }
            res.json(users);
        });
    },
    updateUserStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        updateUserStatus(id, status, (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Failed to update user status" });
            }
            res.status(204).send();
        });
    },
    updateExpertStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        updateExpertStatus(id, status, (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Failed to update expert status" });
            }
            res.status(204).send();
        });
    },
    
};