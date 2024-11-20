const pool = require("../../config/database");

module.exports = {
    addCategory: (name, parentId, callback) => {
        pool.query(
            "INSERT INTO categories (name_category, parent_id) VALUES (?, ?)",
            [name, parentId],
            (error, results) => {
                if (error) return callback(error);
                callback(null, results.insertId);
            }
        );
    },
    updateCategory: (id, name, parentId, callback) => {
        pool.query(
            "UPDATE categories SET name_category = ?, parent_id = ? WHERE category_id = ?",
            [name, parentId, id],
            (error, results) => {
                if (error) return callback(error);
                callback(null, results);
            }
        );
    },
    deleteCategory: (id, callback) => {
        pool.query(
            "SELECT parent_id FROM categories WHERE category_id = ?",
            [id],
            (error, results) => {
                if (error) return callback(error);
    
                if (results.length > 0 && results[0].parent_id === null) {
                    return callback({ code: 403 }, null);
                }
    
                pool.query(
                    "DELETE FROM categories WHERE category_id = ?",
                    [id],
                    (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    }
                );
            }
        );
    },
    getCategories: (callback) => {
        pool.query("SELECT * FROM categories", (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
    getCategoriesParent: (callback) => {
        pool.query("SELECT * FROM categories WHERE parent_id IS NULL", (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    // Language Service
    addLanguage: (name, callback) => {
        pool.query(
            "INSERT INTO languages (name_language) VALUES (?)",
            [name],
            (error, results) => {
                if (error) return callback(error);
                callback(null, results.insertId);
            }
        );
    },
    updateLanguage: (id, name, callback) => {
        pool.query(
            "UPDATE languages SET name_language = ? WHERE language_id = ?",
            [name, id],
            (error, results) => {
                if (error) return callback(error);
                callback(null, results);
            }
        );
    },
    deleteLanguage: (id, callback) => {
        pool.query("DELETE FROM languages WHERE language_id = ?", [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
    getLanguages: (callback) => {
        pool.query("SELECT * FROM languages", (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    // User Service
    getUsers: (callback) => {
        pool.query("SELECT * FROM users", (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
    //khoa tai khoan nguoi dung
    updateUserStatus: (id, status, callback) => {
        pool.query(
            "UPDATE users SET operator_status = ? WHERE user_id = ?",
            [status, id],
            (error, results) => {
                if (error) return callback(error);
                callback(null, results);
            }
        );
    },
    updateExpertStatus: (id, status, callback) => {
        pool.query(
            "UPDATE users SET is_approval = ? WHERE user_id = ?",
            [status, id],
            (error, results) => {
                if (error) return callback(error);
                callback(null, results);
            }
        );
    }
};