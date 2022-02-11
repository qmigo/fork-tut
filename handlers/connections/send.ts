import log from "../../utils/logger";
import checkAuth from "../../middlewares/checkAuth";
import { UserDocument } from "../../types/userModel.types";
import { SecureRequest } from "../../types/secureUser.types";
import { Response, Router } from "express";
import User from "../../models/user.model";
const router = Router();

router.post("/send", checkAuth, async (req: SecureRequest, res: Response) => {
  log.info(`${req.method.toUpperCase()} ${req.url}`);

  const user = req.user as UserDocument;
  // getting data from the request body and checking if it is valid
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({
      message: "Invalid Data",
    });
  }

  try {
    // finding the user to update and checking if it exists
    const friend: UserDocument = await User.findOne({ username });
    if (!friend) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    // add friend to the user's sentFriendRequests list
    const updateUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: { sentFriendRequests: friend._id },
      },
      { new: true }
    );

    // add user to the friend's receivedFriendRequests list
    friend.receivedFriendRequests.push(user._id);
    await friend.save();
    return res.status(200).json({
      message: "Friend request sent",
      user: updateUser,
    });
  } catch (err) {
    // incase of any of the above fails, return an error response
    log.error(err);
    return res.status(500).json({
      message: "Error in sending request",
    });
  }
});

export default router;
