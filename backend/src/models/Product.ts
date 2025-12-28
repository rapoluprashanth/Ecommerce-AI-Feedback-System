import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  categoryId: mongoose.Types.ObjectId;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String }],
    ratingAvg: { type: Number },
    ratingCount: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
