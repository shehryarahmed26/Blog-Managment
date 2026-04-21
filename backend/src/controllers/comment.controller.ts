import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { HttpError } from '../middleware/errorHandler';

export const listForPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, 'Post not found');

  const comments = await Comment.find({ post: id })
    .sort({ createdAt: -1 })
    .populate('author', 'name email');

  res.json({ comments });
});

export const createForPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, 'Post not found');

  const { content } = req.body as { content: string };
  const comment = await Comment.create({
    content,
    post: new Types.ObjectId(id),
    author: new Types.ObjectId(req.user.id),
  });
  const populated = await comment.populate('author', 'name email');
  res.status(201).json({ comment: populated });
});
