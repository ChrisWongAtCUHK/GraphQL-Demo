import { ApolloServer, gql, SchemaDirectiveVisitor } from 'apollo-server';
import { defaultFieldResolver} from 'graphql';

// Directive 實作
class UpperCaseDirective extends SchemaDirectiveVisitor {
  // override field Definition 的實作
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    // 更改 field 的 resolve function
    field.resolve = async function(...args) {
      // 取得原先 field resolver 的計算結果 (因為 field resolver 傳回來的有可能是 promise 故使用 await)
      const result = await resolve.apply(this, args);
      // 將得到的結果再做預期的計算 (toUpperCase)
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      // 回傳最終值 (給前端)
      return result;
    };
  }
};

// 定義新的 Directive
const typeDefs = gql`
  directive @upper on FIELD_DEFINITION

  type Query {
    hello: String @upper
  }
`;

// field Resolver
const resolvers = {
  Query: {
    hello: () => 'world'
  }
};

// 初始化 Web Server ，傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers,
  // 將 schema 的 directive 與實作連接並傳進 ApolloServer。
  schemaDirectives: {
    upper: UpperCaseDirective
  }
});

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`);
});