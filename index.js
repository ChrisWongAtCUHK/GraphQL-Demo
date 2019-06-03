
import { ApolloServer, SchemaDirectiveVisitor, ForbiddenError } from 'apollo-server';

const jwt = require('jsonwebtoken');

require('dotenv').config();

const { typeDefs, resolvers } = require('./schema');
const { userModel, postModel } = require('./models').default;

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 2;
const SECRET = process.env.SECRET || 'just_some_secret';

class IsAuthenticatedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const context = args[2];
      // 檢查有沒有 context.me
      if (!context.me) throw new ForbiddenError('Not logged in~.');

      // 確定有 context.me 後才進入 Resolve Function
      const result = await resolve.apply(this, args);
      return result;
    };
  }
}

// 初始化 Web Server ，傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers,
  context: async ({ req }) => {
    const context = { 
      secret: SECRET, 
      saltRounds: SALT_ROUNDS,
      userModel,
      postModel
    };
    const token = req.headers['x-token'];
    if (token) {
      try {
        // 檢查 token + 取得解析出的資料
        const me = await jwt.verify(token, SECRET);
        // 放進 context
        return { ...context, me };
      } catch (e) {
        throw new Error('Your session expired. Sign in again.');
      }
    }
    return context;
  },
  schemaDirectives: {
    // 一樣要記得放進 ApolloServer 中
    isAuthenticated: IsAuthenticatedDirective
  }
});

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`);
});