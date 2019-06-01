const posts = [
    { id: 1, authorId: 1, title: "Hello World!", body: "This is my first post.", likeGiverIds: [2], createdAt: '2018-10-22T01:40:14.941Z' },
    { id: 2, authorId: 2, title: "Good Night", body: "Have a Nice Dream =)", likeGiverIds: [2, 3], createdAt: '2018-10-24T01:40:14.941Z' } 
];

export function getAllPosts() { return posts; }
export function filterPostsByUserId(userId) { return posts.filter(post => userId === post.authorId); }
export function findPostByPostId(id) { return posts.find(post => post.id === Number(id)); }
export function addPost({ authorId, title, body }) {
    return (posts[posts.length] = {
        id: posts[posts.length - 1].id + 1,
        authorId,
        title,
        body,
        likeGiverIds: [],
        createdAt: new Date().toISOString()
    });
}
export function updatePost(postId, data) { return Object.assign(findPostByPostId(postId), data); }
export function deletePost(postId) { return posts.splice(posts.findIndex(post => post.id === Number(postId)), 1)[0]; }