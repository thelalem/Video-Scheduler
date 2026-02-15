import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
    {
        s3Url: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sendAt: {
            type: Date,
            required: true,
        },
        sent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);
scheduleSchema.index({ sendAt: 1, sent: 1 });
const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;