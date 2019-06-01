import { gql } from 'apollo-server';
const { userModel, postModel } = require('../models').default;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
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

extend type Query {
  "取得所有貼文"
  posts: [Post]
  "依照 id 取得特定貼文"
  post(id: ID!): Post
}
`;
  
// Resolvers
const resolvers = {
    Query: {
        posts: () => postModel.getAllPosts(),
        post: (parent, { id }, context) => postModel.findPostByPostId(id)
    },
    Post: {
        author: (parent, args, context) => userModel.findUserByUserId(parent.authorId),
        likeGivers: (parent, args, context) =>
            userModel.filterUsersByUserIds(parent.likeGiverIds)
    }
};  
  
module.exports = {
    typeDefs,
    resolvers
};