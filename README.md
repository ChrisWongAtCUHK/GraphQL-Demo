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
