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

const findUserById = (userId) => users.find(user => user.id === Number(userId));
export function getAllUsers() { return users; }
export function filterUsersByUserIds(userIds) { return users.filter(user => userIds.includes(user.id)); }
export function findUserByUserId(userId) { return findUserById(userId); }
export function findUserByName(name) { return users.find(user => user.name === name); }
export function updateUserInfo(userId, data) { return Object.assign(findUserById(userId), data); }
export function addUser({ name, email, password }) {
    return (users[users.length] = {
        id: users[users.length - 1].id + 1,
        name,
        email,
        password
    });
}