export const getErrorPage = (req, res, next) => {
  res.status(404).render("error.ejs", {
    status: 404,
    message: "Page not found",
    path: "/error",
    isAuthenticated: req.session.isLoggedIn,
  });
  // next();
};
export const get500Page = (req, res, next) => {
  res.status(500).render("500.ejs", {
    status: 500,
    message: "",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    error: "",
  });
  // next();
};
