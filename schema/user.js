const {
    gql,
    ForbiddenError,
    AuthenticationError
} = require('apollo-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { userModel, postModel } = require('../models').default;

const isPostAuthor = resolverFunc => (parent, args, context) => {
    const { postId } = args;
    const { me } = context;
    const isAuthor = postModel.findPostByPostId(postId).authorId === me.id;
    if (!isAuthor) throw new ForbiddenError('Only Author Can Delete this Post');
    return resolverFunc.apply(null, [parent, args, context]);
};

const isPostExists = resolverFunc => (parent, args, context) => {
    const { postId } = args;
    const post = postModel.findPostByPostId(parseInt(postId));
    if (!post) throw new Error(`Post ${postId} Not Exists`);
    return resolverFunc.apply(null, [parent, args, context]);
};

// Construct a schema, using GraphQL schema language
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

extend type Query {
  "取得當下使用者"
  me: User
  "取得特定 user (name 為必填)"
  user(name: String!): User
  "取得所有使用者"
  users: [User]
}

input UpdateMyInfoInput {
  name: String
  age: Int
}

input AddPostInput {
  title: String!
  body: String
}

extend type Mutation {
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

type Token {
    token: String!
  }
`;

// helper functions
const hash = (text, saltRounds) => bcrypt.hash(text, saltRounds);
const createToken = ({ id, email, name }, secret) =>
    jwt.sign({ id, email, name }, secret, {
    expiresIn: '1d'
    });

const isAuthenticated = resolverFunc => (parent, args, context) => {
    if (!context.me) throw new ForbiddenError('Not logged in.');
    return resolverFunc.apply(null, [parent, args, context]);
};

// Resolvers
const resolvers = {
    Query: {
      me: isAuthenticated((parent, args, { me }) => userModel.findUserByUserId(me.id)),
      user: (root, { name }, context) => findUserByName(name),
      users: () => userModel.getAllUsers()
    },
    // Mutation Type Resolver
    Mutation : {
      updateMyInfo: isAuthenticated((parent, { input }, { me }) => {
        const data = ["name", "age"].reduce(
          (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
          {}
        );
  
        return userModel.updateUserInfo(me.id, data);
      }),
      addFriend: isAuthenticated((parent, { userId }, { me }) => {
        if (!me) throw new Error ('Plz Log In First');
        const currentMe = userModel.findUserByUserId(me.id);
  
        if (currentMe.friendIds.includes(Number(userId)))
          throw new Error(`User ${userId} Already Friend.`);
  
        const friend = userModel.findUserByUserId(userId);
        userModel.updateUserInfo(userId, { friendIds: friend.friendIds.concat(me.id) });
  
        return userModel.updateUserInfo(me.id, {
          friendIds: currentMe.friendIds.concat(Number(userId))
        });
      }),
      addPost: isAuthenticated((root, { input }, { me }) => {
        const { title, body } = input;
        return postModel.addPost({ authorId: me.id, title, body });
      }),
      likePost: isAuthenticated((root, { postId }, { me }) => {
        const post = postModel.findPostByPostId(parseInt(postId));
        if (!post) throw new Error(`Post ${postId} Not Exists`);
  
        if(!post.likeGiverIds) post.likeGiverIds = [];
        if (post.likeGiverIds.includes(me.id)) {
          // 如果已經按過讚就收回
          const index = post.likeGiverIds.findIndex(v => v === me.id);
          post.likeGiverIds.splice(index, 1);
          return postModel.updatePost(postId, {
            likeGiverIds: post.likeGiverIds
          });
        } else {
          // 否則就加入 likeGiverIds 名單
          return postModel.updatePost(postId, {
            likeGiverIds: post.likeGiverIds.concat(me.id)
          });
        }
      }),
      deletePost: isAuthenticated(
        isPostExists(
          isPostAuthor((root, { postId }, { me }) => postModel.deletePost(postId))
        )
      ),
      signUp: async (root, { name, email, password }, { saltRounds }) => {
        // 1. 檢查不能有重複註冊 email
        const isUserEmailDuplicate = userModel.getAllUsers().some(user => user.email === email);
        if (isUserEmailDuplicate) throw new Error('User Email Duplicate');
        // 2. 將 passwrod 加密再存進去。非常重要 !!
        const hashedPassword = await hash(password, saltRounds);
        // 3. 建立新 user
        return userModel.addUser({ name, email, password: hashedPassword });
      },
      login: async (root, { email, password }, { secret }) => {
        // 1. 透過 email 找到相對應的 user
        const user = userModel.getAllUsers().find(user => user.email === email);
        if (!user) throw new Error('Email Account Not Exists');
  
        // 2. 將傳進來的 password 與資料庫存的 user.password 做比對
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) throw new Error('Wrong Password');
  
        // 3. 成功則回傳 token
        return { token: await createToken(user, secret) };
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
      posts: (parent, args, context) => postModel.filterPostsByUserId(parent.id),
      friends: (parent, args, context) => userModel.filterUsersByUserIds(parent.friendIds || [])
    }
  }; 
  

module.exports = {
    typeDefs,
    resolvers
}