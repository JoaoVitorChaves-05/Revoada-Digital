import { Router } from 'express';
import {
	createPost,
	createReply,
	deletePost,
	deleteReply,
	getPost,
	listPosts,
	listReplies,
	updatePost,
	updateReply,
} from '../controllers/forum.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import {
	createForumPostSchema,
	createForumReplySchema,
	updateForumPostSchema,
	updateForumReplySchema,
} from '../schemas/forum.schema';

const forumRouter = Router();

forumRouter.post('/posts', validateSchema(createForumPostSchema), createPost);
forumRouter.get('/posts', listPosts);
forumRouter.get('/posts/:id', getPost);
forumRouter.put('/posts/:id', validateSchema(updateForumPostSchema), updatePost);
forumRouter.delete('/posts/:id', deletePost);

forumRouter.post('/posts/:postId/replies', validateSchema(createForumReplySchema), createReply);
forumRouter.get('/posts/:postId/replies', listReplies);
forumRouter.put('/posts/:postId/replies/:id', validateSchema(updateForumReplySchema), updateReply);
forumRouter.delete('/posts/:postId/replies/:id', deleteReply);

export default forumRouter;