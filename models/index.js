// 假資料
const users = [
    {
        id: 1,
        email: 'fong@test.com',
        password: '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', // 123456
        name: 'Fong',
        age: 23,
        height: 175.0,
        weight: 70.0,
        friendIds: [2, 3]
    },
    {
        id: 2,
        name: 'Kevin',
        email: 'kevin@test.com',
        passwrod: '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', // 123456
        age: 40,
        height: 185.0,
        weight: 90.0,
        friendIds: [1]
    },
    {
        id: 3,
        email: 'mary@test.com',
        password: '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', // 123456
        name: 'Mary',
        age: 18,
        height: 162,
        weight: null,
        friendIds: [1]
    }
];
  
const posts = [
    { id: 1, authorId: 1, title: "Hello World!", body: "This is my first post.", likeGiverIds: [2], createdAt: '2018-10-22T01:40:14.941Z' },
    { id: 2, authorId: 2, title: "Good Night", body: "Have a Nice Dream =)", likeGiverIds: [2, 3], createdAt: '2018-10-24T01:40:14.941Z' } 
];

export function getAllUsers() { return users; }
export function getAllPosts() { return posts; }
export function filterPostsByUserId(userId) { return posts.filter(post => userId === post.authorId); }
export function filterUsersByUserIds(userIds) { return users.filter(user => userIds.includes(user.id)); }
export function findUserByUserId(userId) { return users.find(user => user.id === Number(userId)); }
export function findUserByName(name) { return users.find(user => user.name === name); }
export function findPostByPostId(id) { return posts.find(post => post.id === Number(id)); }
export function updateUserInfo(userId, data) { return Object.assign(findUserByUserId(userId), data); }
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
export function addUser({ name, email, password }) {
    return (users[users.length] = {
        id: users[users.length - 1].id + 1,
        name,
        email,
        password
    });
}
export function deletePost(postId) { return posts.splice(posts.findIndex(post => post.id === Number(postId)), 1)[0]; }