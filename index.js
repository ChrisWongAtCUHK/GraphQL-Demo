import { ApolloServer, gql } from 'apollo-server';

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

// The GraphQL schema
const typeDefs = gql`
  # Enum Type 為一種特殊的 Scalar Type ，使用時只能出現裡面有定義到的值且不需要加引號
  # 進入 JavaSript 中使用時，會轉為 String 格式
  """
  高度單位
  """
  enum HeightUnit {
    "公尺"
    METRE
    "公分"
    CENTIMETRE
    "英尺 (1 英尺 = 30.48 公分)"
    FOOT
  }

  """
  重量單位
  """
  enum WeightUnit {
    "公斤"
    KILOGRAM
    "公克"
    GRAM
    "磅 (1 磅 = 0.45359237 公斤)"
    POUND
  }

  """
  使用者資訊
  """
  type User {
    "識別碼"
    id: ID!
    "帳號 email"
    email: String!
    "名字"
    name: String
    "年齡"
    age: Int
    "身高 (預設為 CENTIMETRE)"
    height(unit: HeightUnit = CENTIMETRE): Float
    "體重 (預設為 KILOGRAM)"
    weight(unit: WeightUnit = KILOGRAM): Float @deprecated (reason: "It's secret")
    "朋友們"
    friends: [User]
    "貼文"
    posts: [Post]
  }

  """
  貼文
  """
  type Post {
    "識別碼"
    id: ID!
    "作者"
    author: User
    "標題"
    title: String
    "內容"
    body: String
    "按讚者"
    likeGivers: [User]
    "建立時間 (ISO 格式)"
    createdAt: String
  }

  type Query {
    "A simple type for getting started!"
    hello: String
    "取得當下使用者"
    me: User
    "取得特定 user (name 為必填)"
    user(name: String!): User
    "取得所有使用者"
    users: [User]
    "取得所有貼文"
    posts: [Post]
    "依照 id 取得特定貼文"
    post(id: ID!): Post
  }

  input UpdateMyInfoInput {
    name: String
    age: Int
  }
  
  input AddPostInput {
    title: String!
    body: String
  }

  # Mutation 定義
  type Mutation {
    "更新me"
    updateMyInfo(input: UpdateMyInfoInput!): User
    "新增朋友"
    addFriend(userId: ID!): User
    "新增貼文"
    addPost(input: AddPostInput!): Post
    "貼文按讚 (收回讚)"
    likePost(postId: ID!): Post
  }
`;

const meId = 2;

// Helper Functions
const findUserByName = name => users.find(user => user.name === name);
const findPostByPostId = id => posts.find(post => post.id === Number(id));
const filterPostsByUserId = userId =>
  posts.filter(post => userId === post.authorId);
const filterUsersByUserIds = userIds =>
  users.filter(user => userIds.includes(user.id));
const findUserByUserId = userId => users.find(user => user.id === Number(userId));
const updateUserInfo = (userId, data) =>
  Object.assign(findUserByUserId(userId), data);
const addPost = ({ authorId, title, body }) =>
  (posts[posts.length] = {
  id: posts[posts.length - 1].id + 1,
  authorId,
  title,
  body,
  likeGiverIds: [],
  createdAt: new Date().toISOString()
});
const updatePost = (postId, data) =>
  Object.assign(findPostByPostId(postId), data);

// field Resolver
const resolvers = {
  Query: {
    hello: () => 'world',
    me: () => findUserByUserId(meId),
    user: (root, { name }, context) => findUserByName(name),
    users: () => users,
    posts: () => posts,
    post: (parent, { id }, context) => findPostByPostId(id)
  },
  // Mutation Type Resolver
  Mutation : {
    updateMyInfo: (root, { input }, context) => {
      // 過濾空值
      const data = ["name", "age"].reduce(
        (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
        {}
      );

      return updateUserInfo(meId, data);
    },
    addFriend: (parent, { userId }, context) => {
      const me = findUserByUserId(meId);
      if (me.friendIds.includes(Number(userId)))
        throw new Error(`User ${userId} Already Friend.`);

      const friend = findUserByUserId(userId);
      const newMe = updateUserInfo(meId, {
        friendIds: me.friendIds.concat(Number(userId))
      });
      updateUserInfo(userId, { friendIds: friend.friendIds.concat(meId) });

      return newMe;
    },
    addPost: (root, { input }, context) => {
      const { title, body } = input;
      return addPost({ authorId: meId, title, body });
    },
    likePost: (root, { postId }, context) => {
      const post = findPostByPostId(parseInt(postId));
      if (!post) throw new Error(`Post ${postId} Not Exists`);

      if(!post.likeGiverIds) post.likeGiverIds = [];
      if (post.likeGiverIds.includes(meId)) {
        // 如果已經按過讚就收回
        const index = post.likeGiverIds.findIndex(v => v === meId);
        post.likeGiverIds.splice(index, 1);
        return updatePost(postId, {
          likeGiverIds: post.likeGiverIds
        });
      } else {
        // 否則就加入 likeGiverIds 名單
        return updatePost(postId, {
          likeGiverIds: post.likeGiverIds.concat(meId)
        });
      }
    },
  },
  User: {
    // 對應到 Schema 的 User.height
    height: (parent, args, context) => {
      const { unit } = args;
      const { height } = parent;
      // 另外支援 default 值 CENTIMETRE
      if(!unit || unit === "CENTIMETRE") return height;
      else if (unit === "METRE") return height / 100;
      else if (unit === "FOOT") return height / 30.48;
      throw new Error(`Height unit "${unit}" not supported.`);
    },// 對應到 Schema 的 User.weight
    weight: (parent, args, context) => {
      const { unit } = args;
      const { weight } = parent;
      // 支援 default 值 KILOGRAM
      if(!unit || unit === "KILOGRAM") return weight;
      else if (unit === "GRAM") return weight * 1000;
      else if (unit === "POUND") return weight / 0.45359237;
      throw new Error(`Weight unit "${unit}" not supported.`);
    },
    posts: (parent, args, context) => filterPostsByUserId(parent.id),
    friends: (parent, args, context) => filterUsersByUserIds(parent.friendIds || [])
  },
  // 2. Post type resolver
  Post: {
    author: (parent, args, context) => findUserByUserId(parent.authorId),
    likeGivers: (parent, args, context) =>
      filterUsersByUserIds(parent.likeGiverIds)
  }
};

// 初始化 Web Server ，傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers
});

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`);
});