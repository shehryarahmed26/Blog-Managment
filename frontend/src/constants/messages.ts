export const MESSAGES = {
  loading: 'Loading…',
  errorGeneric: 'Something went wrong.',
  auth: {
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',
  },
  posts: {
    deleteConfirm: 'Delete this post?',
    saveFailed: 'Failed to save post',
    deleteFailed: 'Failed to delete post',
    statusFailed: 'Failed to update status',
    notFound: 'Post not found',
    empty: 'No posts match your filters.',
    emptyDashboard: "You haven't created any posts yet.",
  },
  comments: {
    empty: 'No comments yet.',
    postFailed: 'Failed to post comment',
    loginToComment: 'Log in to leave a comment.',
  },
} as const;
