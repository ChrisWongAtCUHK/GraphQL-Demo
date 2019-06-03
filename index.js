
import { ApolloServer, gql } from 'apollo-server';
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { DateTime } = require('@okgrow/graphql-scalars');

const typeDefs = gql`
"""
日期格式。顯示時以 Unix Timestamp in Milliseconds 呈現。
"""
scalar DateTime

# 宣告後就可以在底下直接使用
type Query {
  # 獲取現在時間
  now: DateTime
  # 詢問日期是否為週五... TGIF!!
  isFriday(date: DateTime!): Boolean
}
`;

const resolvers = {
  DateTime ,
  Query: {
    now: () => new Date(),
    isFriday: (root, { date }) => date.getDay() === 5
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`);
});