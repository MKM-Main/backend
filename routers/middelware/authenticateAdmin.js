export const authenticateAdmin = (req, res, next) => {
    if (req.user.role === "admin") {
        next()
    } else {
        res.status(401).send({message: "Forbidden"})
    }
}
