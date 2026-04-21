import { Schema, model, Document, Types } from 'mongoose';

export type PostStatus = 'draft' | 'published';

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId;
  status: PostStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

PostSchema.index({ title: 'text', tags: 'text' });

export const Post = model<IPost>('Post', PostSchema);
