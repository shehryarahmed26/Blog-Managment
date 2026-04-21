import Joi from 'joi';

export const createPostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(30)).default([]),
  status: Joi.string().valid('draft', 'published').default('draft'),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  content: Joi.string().min(1),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(30)),
  status: Joi.string().valid('draft', 'published'),
}).min(1);

export const statusSchema = Joi.object({
  status: Joi.string().valid('draft', 'published').required(),
});

export const listQuerySchema = Joi.object({
  search: Joi.string().trim().allow('').max(100),
  tag: Joi.string().trim().lowercase().max(30),
  status: Joi.string().valid('draft', 'published'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});
