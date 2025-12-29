import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    CategoryId?: mongoose.Types.ObjectId;
}

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true },
        CategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    },
    { timestamps: true }
);

// Text index for search
categorySchema.index({ name: "text" });

export default mongoose.model<ICategory>("Category", categorySchema);
