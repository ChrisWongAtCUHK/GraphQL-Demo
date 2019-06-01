# Think in GraphQL系列
* [GraphQL 入門： Server Setup X NodeJS X Apollo (寫程式囉！)](https://ithelp.ithome.com.tw/articles/10202644)
```graphql
{
    hello
}
```
* [GraphQL 入門：初次實作 Schema 與 Resolver](https://ithelp.ithome.com.tw/articles/10203333)
```graphql
{
    me {
        id
        name
        age
    }
}
```
* [GraphQL 入門： Schema 與 Resolver 進階功能！ (Array, Non-Null, Field Resolver)](https://ithelp.ithome.com.tw/articles/10203628)
```graphql
{
    users {
        id
        name
        friends {
            id
            name
        }
    }
}
```
* [GraphQL 入門： Arguments, Aliases, Fragment 讓 Query 更好用 (進階 Query)](https://ithelp.ithome.com.tw/articles/10203965)
    - Arguments
  ```graphql
      {
          # 傳入 Argument "Fong" (Argument for Object Type)
          user(name: "Fong") {
              id
              name
              # 傳入 Argument METRE (Argument for Scalar Type)，
              # 此 field 回傳 FLOAT type
              height
              # 傳入 Argument POUND (Argument for Scalar Type)，
              # 此 field 回傳 FLOAT type
              weight(unit: POUND)
          }
      }
  ```
    - Variables
  ```graphql
      # 因為 user 的 argument name 為必填 `!`，所以在參數宣告列上也要加上 `!`
      query ($name: String!) {
          user(name: $name) {
              id
              name
          }
      }
  ```
  ```json
      {
          "name": "Fong"
      }
  ```
    - Operation Name
  ```graphql
      query MyBasicInfo {
          me {
              id
              name
          }
      }
  ```
    - Aliases
  ```graphql
      query UserData($name1: String!, $name2: String!, $name3: String!) {
          user1: user(name: $name1) {
              id
              name
          },
          user2: user(name: $name2) {
              id
              name
          },
          user3: user(name: $name3) {
              id
              name
          }
      }
  ```
  ```json
      {
          "name1": "Fong",
          "name2": "Kevin",
          "name3": "Mary"
      }
  ```
    - Fragment
  ```graphql
      query {
          user1: user(name: "Fong") {
              ...userData
          },
          user2: user(name: "Kevin") {
              ...userData
          }
      }
      fragment userData on User {
          id
          name
      }
  ```
* [GraphQL 入門： 初次使用 Mutation](https://ithelp.ithome.com.tw/articles/10204294)
    - 取得所有貼文
  ```graphql
      {
          posts {
              id
              title
              author {
                  name
              }
              likeGivers {
                  id
                  name
              }
          }
      }
  ```
    - 新增 post
  ```graphql
      # Operation Type 為 mutation 時不可省略
      mutation AddPostAgain ($input: AddPostInput) {
          addPost(input: $input) {
              id
              title
              author {
                  name
              }
          }
      }
  ```
    - 按讚
  ```graphql
      # Operation Type 為 mutation 時不可省略
      mutation {
          likePost(postId: 1) {
              id
              title
              author {
                  name
              }
          }
  }
  ```
    - Input Object Type
  ```graphql
      # Operation Type 為 mutation 時不可省略
      mutation AddPostAgain ($input: AddPostInput!) {
          addPost(input: $input) {
              id
              title
              author {
                  name
              }
          }
  }
  ```
  ```json
      {
          "input": {
              "title": "Input Object Is Awesome",
              "content": "ZZZZZZZZZZZZZ"
          }
      }
  ```
* [打造 GraphQL API Server 應用：部落格社交軟體 - 1 (Query & Mutation Part)](https://ithelp.ithome.com.tw/articles/10205091)
    - Query user
  ```graphql
      {
          me {
              email
              name
              posts {
                  id
                  author {
                      name
                  }
              }
              friends {
                  email
              }
          }
          user(name: "Kevin") {
              name
          }
          users {
              id
          }
      }
  ```
    - Query post
  ```graphql
      {
          posts {
              id
              title
              body
              author {
                  id
                  name
                  posts {
                      id
                  }
              }
          }
          post(id: 1) {
              title
              body
              author {
                  name
              }
              likeGivers {
                  id
                  name
              }
          }
      }
  ```
	- Mutation Type Demo
  ```graphql
  mutation ($updateMeInput: UpdateMyInfoInput!, $addPostInput: AddPostInput!) {
          updateMyInfo (input: $updateMeInput) {
              name
              age
          }
          addPost (input: $addPostInput) {
              id
              title
              body
          }
          addFriend (userId: 3) {
              id
              name
              friends{
                  id
                  name
              }
          }
          # Can run this independently to toggle like
          likePost (postId: 3) {
              id
              title
              body
              author {
                  name
              }
              likeGivers {
                  id
                  name
                  age
              }
          }
  }
  ```
  ```json
  {
        "updateMeInput": {
          "name": "FX",
          "age": 24
        },
        "addPostInput": {
          "title": "Hello World2",
          "body": "testttttinggggg"
        }
  }
  ```
* [打造一個 GraphQL API Server 應用：部落格社交軟體 - 2 (Authentication & Authorization)](https://ithelp.ithome.com.tw/articles/10205426)
    - Registry & Login
    ```graphql
    mutation {
      signUp(name: "TestMan", email: "test@test.com", password: "123456"){
        id
        name
        email
      }
      login(email: "test@test.com", password: "123456"){
        token
      }
    }
    ```
    - Authentication
    ```json
    {
        "x-token": "eyJh......."
    }
    ```
    ```graphql
    {
        me {
          id
          name
          email
        }
    }
    ```
    ```graphql
    mutation {
          signUp(name: "TestMan", email: "test@test.com", password: "123456"){
            id
            name
            email
          }
          login(email: "test@test.com", password: "123456"){
            token
          }
    }
    ```
    - Authentication with variables
    ```graphql
    mutation ($updateMeInput: UpdateMyInfoInput!, $addPostInput:AddPostInput!) {
          updateMyInfo(input: $updateMeInput) {
            id
            name
            age
          }
          addPost(input: $addPostInput) {
            id
            title
            body
            author {
              name
            }
            createdAt
          }
          likePost(postId: 1) {
            id
          }
    }
    ```
    ```json
    {
        "updateMeInput": {
          "name": "NewTestMan",
          "age": 28
        },
        "addPostInput": {
          "title": "Test ~ Hello World",
          "body": "testttttinggggg"
        }
    }
    ```
