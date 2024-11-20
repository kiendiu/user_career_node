const router = require("express").Router();

const {
    createCategory,
    modifyCategory,
    removeCategory,
    listCategories,
    listCategoriesParent,
    createLanguage,
    modifyLanguage,
    removeLanguage,
    listLanguages,
    listUsers,
    updateUserStatus,
    updateExpertStatus
} = require("./admin.controller");

// Category routes
router.post("/categories", createCategory);
router.put("/categories/:id", modifyCategory);
router.delete("/categories/:id", removeCategory);
router.get("/categories", listCategories);
router.get("/categories/parent", listCategoriesParent);

// Language routes
router.post("/languages", createLanguage);
router.put("/languages/:id", modifyLanguage);
router.delete("/languages/:id", removeLanguage);
router.get("/languages", listLanguages);

// User routes
router.get("/users", listUsers);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/expert", updateExpertStatus);

module.exports = router;