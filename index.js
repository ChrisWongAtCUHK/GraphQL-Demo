import { ApolloServer, gql, ForbiddenError } from 'apollo-server';
const isAuthenticated = resolverFunc => (parent, args, context) => {
  if (!context.me) throw new ForbiddenError('Not logged in.');
  return resolverFunc.apply(null, [parent, args, context]);
};

// 引入外部套件
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 定義 bcrypt 加密所需 saltRounds 次數
const SALT_ROUNDS = 2;
// 定義 jwt 所需 secret (可隨便打)
const SECRET = 'just_a_random_secret';

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
    weight(unit: WeightUnit = KILOGRAM): Float
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

  type Token {
    token: String!
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
    "刪貼文"
    deletePost(postId: ID!): Post
    "貼文按讚 (收回讚)"
    likePost(postId: ID!): Post
    "註冊。 email 與 passwrod 必填"
    signUp(name: String, email: String!, password: String!): User
    "登入"
    login (email: String!, password: String!): Token

  }
`;

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
const hash = text => bcrypt.hash(text, SALT_ROUNDS);
const addUser = ({ name, email, password }) => (
  users[users.length] = {
    id: users[users.length - 1].id + 1,
    name,
    email,
    password
  }
);
const createToken = ({ id, email, name }) => jwt.sign({ id, email, name }, SECRET, {
  expiresIn: '1d'
});

const deletePost = (postId) =>
  posts.splice(posts.findIndex(post => post.id === Number(postId)), 1)[0];
  
const isPostExists = resolverFunc => (parent, args, context) => {
  const { postId } = args;
  const post = findPostByPostId(parseInt(postId));
      if (!post) throw new Error(`Post ${postId} Not Exists`);
  return resolverFunc.apply(null, [parent, args, context]);
}

const isPostAuthor = resolverFunc => (parent, args, context) => {
  const { postId } = args;
  const { me } = context;
  const isAuthor = findPostByPostId(postId).authorId === me.id;
  if (!isAuthor) throw new ForbiddenError('Only Author Can Delete this Post');
  return resolverFunc.apply(null, [parent, args, context]);
}

// field Resolver
const resolvers = {
  Query: {
    hello: () => 'world',
    me: isAuthenticated((parent, args, { me }) => findUserByUserId(me.id)),
    user: (root, { name }, context) => findUserByName(name),
    users: () => users,
    posts: () => posts,
    post: (parent, { id }, context) => findPostByPostId(id)
  },
  // Mutation Type Resolver
  Mutation : {
    updateMyInfo: isAuthenticated((parent, { input }, { me }) => {
      const data = ["name", "age"].reduce(
        (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
        {}
      );

      return updateUserInfo(me.id, data);
    }),
    addFriend: isAuthenticated((parent, { userId }, { me }) => {
      if (!me) throw new Error ('Plz Log In First');
      const currentMe = findUserByUserId(me.id);

      if (currentMe.friendIds.includes(Number(userId)))
        throw new Error(`User ${userId} Already Friend.`);

      const friend = findUserByUserId(userId);
      updateUserInfo(userId, { friendIds: friend.friendIds.concat(me.id) });

      return updateUserInfo(me.id, {
        friendIds: currentMe.friendIds.concat(Number(userId))
      });
    }),
    addPost: isAuthenticated((root, { input }, { me }) => {
      const { title, body } = input;
      return addPost({ authorId: me.id, title, body });
    }),
    likePost: isAuthenticated((root, { postId }, { me }) => {
      const post = findPostByPostId(parseInt(postId));
      if (!post) throw new Error(`Post ${postId} Not Exists`);

      if(!post.likeGiverIds) post.likeGiverIds = [];
      if (post.likeGiverIds.includes(me.id)) {
        // 如果已經按過讚就收回
        const index = post.likeGiverIds.findIndex(v => v === me.id);
        post.likeGiverIds.splice(index, 1);
        return updatePost(postId, {
          likeGiverIds: post.likeGiverIds
        });
      } else {
        // 否則就加入 likeGiverIds 名單
        return updatePost(postId, {
          likeGiverIds: post.likeGiverIds.concat(me.id)
        });
      }
    }),
    deletePost: isAuthenticated(
      isPostExists(
        isPostAuthor((root, { postId }, { me }) => deletePost(postId))
      )
    ),
    signUp: async (root, { name, email, password }, context) => {
      // 1. 檢查不能有重複註冊 email
      const isUserEmailDuplicate = users.some(user => user.email === email);
      if (isUserEmailDuplicate) throw new Error('User Email Duplicate');
      // 2. 將 passwrod 加密再存進去。非常重要 !!
      const hashedPassword = await hash(password, SALT_ROUNDS);
      // 3. 建立新 user
      return addUser({ name, email, password: hashedPassword });
    },
    login: async (root, { email, password }, context) => {
      // 1. 透過 email 找到相對應的 user
      const user = users.find(user => user.email === email);
      if (!user) throw new Error('Email Account Not Exists');

      // 2. 將傳進來的 password 與資料庫存的 user.password 做比對
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) throw new Error('Wrong Password');

      // 3. 成功則回傳 token
      return { token: await createToken(user) };
    }
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
  resolvers,
  context: async ({ req }) => {
    // 1. 取出
    const token = req.headers['x-token'];
    if (token) {
      try {
        // 2. 檢查 token + 取得解析出的資料
        const me = await jwt.verify(token, SECRET);
        // 3. 放進 context
        return { me };
      } catch (e) {
        throw new Error('Your session expired. Sign in again.');
      }
    }
    // 如果沒有 token 就回傳空的 context 出去
    return {};
  }
});

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`);
});