const express = require("express");
const userRouter = express.Router();
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWTSECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const signupBody = zod.object({
  username: zod.String().email(),
  password: zod.String(),
  firstName: zod.String(),
  lastName: zod.string(),
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const updatedBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

userRouter.post("signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const existingUser = User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.password,
    lastName: req.body.lastName,
  });
  const userId = user._id;
  const token = jwt.sign(
    {
      userId,
    },
    JWTSECRET
  );

  res.status(200).json({
    message: "User created successfully",
    token: token,
  });
});

userRouter.get("signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while logging in",
    });
  }
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWTSECRET
    );
    res.status(200).json({
      toke: token,
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const { success } = updatedBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }
  await User.updateOne(
    {
      _id: req.userId,
    },
    req.body
  );
  res.json({
    message: "Updated successfully",
  });
});

userRouter.get("/bulk", async (req, res) => {
  const users = await findOne({});

  res.json({
    user: users.map((user) => {
      ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      });
    }),
  });
});

exports.module = userRouter;
