import User from "../model/user";

export const protect = async (req, res, next) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = req.session.user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
