import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { Post } from '../models/Post';
import { HttpError } from '../middleware/errorHandler';

interface ListQuery {
  search?: string;
  tag?: string;
  status?: 'draft' | 'published';
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  order: 'asc' | 'desc';
}

function buildPagination(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    currentPage: page,
    totalPages,
    totalPosts: total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

async function runList(
  baseFilter: Record<string, unknown>,
  q: ListQuery,
  res: Response
) {
  const filter: Record<string, unknown> = { ...baseFilter };
  if (q.search) filter.$text = { $search: q.search };
  if (q.tag) filter.tags = q.tag;

  const skip = (q.page - 1) * q.limit;
  const sort: Record<string, 1 | -1> = { [q.sortBy]: q.order === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(q.limit)
      .populate('author', 'name email role'),
    Post.countDocuments(filter),
  ]);

  res.json({ posts: items, pagination: buildPagination(total, q.page, q.limit) });
}

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as ListQuery;
  await runList({ status: 'published' }, q, res);
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const q = req.query as unknown as ListQuery;
  const base: Record<string, unknown> =
    req.user.role === 'admin' ? {} : { author: new Types.ObjectId(req.user.id) };
  if (q.status) base.status = q.status;
  await runList(base, q, res);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate('author', 'name email role');
  if (!post) throw new HttpError(404, 'Post not found');

  // Drafts only visible to owner or admin
  if (post.status === 'draft') {
    const authorId =
      (post.author as { _id?: Types.ObjectId })._id ?? (post.author as Types.ObjectId);
    const isOwner = req.user && String(authorId) === req.user.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) throw new HttpError(404, 'Post not found');
  }

  res.json({ post });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const { title, content, tags, status } = req.body as {
    title: string;
    content: string;
    tags: string[];
    status: 'draft' | 'published';
  };
  const post = await Post.create({
    title,
    content,
    tags,
    status,
    author: new Types.ObjectId(req.user.id),
  });
  const populated = await post.populate('author', 'name email role');
  res.status(201).json({ post: populated });
});

function ensureCanMutate(
  post: { author: Types.ObjectId | { _id: Types.ObjectId } },
  user: Express.UserPayload
) {
  const authorId =
    (post.author as { _id?: Types.ObjectId })._id ?? (post.author as Types.ObjectId);
  const isOwner = String(authorId) === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new HttpError(403, 'Access denied');
}

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found');
  ensureCanMutate(post, req.user);

  Object.assign(post, req.body);
  await post.save();
  const populated = await post.populate('author', 'name email role');
  res.json({ post: populated });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found');
  ensureCanMutate(post, req.user);

  await post.deleteOne();
  res.json({ message: 'Deleted' });
});

export const patchStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found');
  ensureCanMutate(post, req.user);

  post.status = (req.body as { status: 'draft' | 'published' }).status;
  await post.save();
  const populated = await post.populate('author', 'name email role');
  res.json({ post: populated });
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const agg = await Post.aggregate([
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalPosts: { $sum: 1 },
              publishedPosts: {
                $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
              },
              draftPosts: {
                $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
              },
            },
          },
        ],
        topAuthors: [
          { $group: { _id: '$author', postCount: { $sum: 1 } } },
          { $sort: { postCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'author',
            },
          },
          { $unwind: '$author' },
          {
            $project: {
              _id: 0,
              authorId: '$author._id',
              name: '$author.name',
              email: '$author.email',
              postCount: 1,
            },
          },
        ],
      },
    },
  ]);

  const totals = agg[0]?.totals?.[0] ?? {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  };
  res.json({
    totalPosts: totals.totalPosts,
    publishedPosts: totals.publishedPosts,
    draftPosts: totals.draftPosts,
    topAuthors: agg[0]?.topAuthors ?? [],
  });
});
