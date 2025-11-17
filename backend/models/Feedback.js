const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "reviewed", "resolved"],
      default: "sent",
    },
    reply: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, collection: "feedbacks" }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
