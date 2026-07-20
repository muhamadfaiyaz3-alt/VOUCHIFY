import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
    user: Types.ObjectId;
    title?: string;
    message: string;
    type: string;
    link?: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String },
        message: { type: String, required: true },
        type: {
            type: String,
            default: "info"
        },
        link: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotification>("Notification", NotificationSchema);
